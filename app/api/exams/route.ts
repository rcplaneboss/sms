import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const exams = await prisma.exam.findMany({
      include: {
        questions: {
          select: { id: true, text: true, type: true }
        },
        attempts: {
          where: { userId: session.user.id },
          select: { id: true, score: true }
        },
        createdBy: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Only teachers and admins can create exams
    if (!session?.user || !['TEACHER', 'ADMIN'].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title } = await req.json();

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        title: title.trim(),
        createdById: session.user.id
      },
      include: {
        questions: true,
        createdBy: { select: { name: true } }
      }
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}
