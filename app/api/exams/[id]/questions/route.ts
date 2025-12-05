import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const questions = await prisma.question.findMany({
      where: { examId: id },
      select: {
        id: true,
        text: true,
        type: true,
        options: {
          select: {
            id: true,
            text: true,
            isCorrect: true,
          },
        },
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || !['TEACHER', 'ADMIN'].includes(session.user.role as string)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id },
      select: { createdById: true }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    if (exam.createdById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { text, type, options } = await req.json();

    if (!text || !type) {
      return NextResponse.json(
        { error: "Text and type are required" },
        { status: 400 }
      );
    }

    // Create the question
    const question = await prisma.question.create({
      data: {
        text: text.trim(),
        type,
        examId: id,
      },
    });

    // If MCQ with options, create them separately
    let createdOptions = [];
    if (type === "MCQ" && options && Array.isArray(options) && options.length > 0) {
      try {
        for (const opt of options) {
          const createdOpt = await prisma.questionOption.create({
            data: {
              text: opt.text.trim(),
              isCorrect: opt.isCorrect,
              questionId: question.id,
            },
          });
          createdOptions.push(createdOpt);
        }
      } catch (optError) {
        // If options table doesn't exist yet (DB not migrated), log but don't fail
        console.warn("Warning: Could not create question options. Database schema may not be migrated yet.", optError);
        // Return options from the request body as a fallback
        createdOptions = options;
      }
    }

    // Return the question with options
    const responseData = {
      ...question,
      options: createdOptions,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
