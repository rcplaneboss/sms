import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { questions: true }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Check if student already has an attempt
    const existingAttempt = await prisma.attempt.findFirst({
      where: {
        userId: session.user.id,
        examId: id
      }
    });

    if (existingAttempt) {
      return NextResponse.json(
        { error: "You have already attempted this exam" },
        { status: 400 }
      );
    }

    // Create new attempt
    const attempt = await prisma.attempt.create({
      data: {
        userId: session.user.id,
        examId: id
      }
    });

    return NextResponse.json({
      attemptId: attempt.id,
      examId: id,
      questionCount: exam.questions.length
    }, { status: 201 });
  } catch (error) {
    console.error("Error starting exam:", error);
    return NextResponse.json(
      { error: "Failed to start exam" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current attempt
    const attempt = await prisma.attempt.findFirst({
      where: {
        userId: session.user.id,
        examId: id
      }
    });

    if (!attempt) {
      return NextResponse.json({
        hasAttempted: false
      });
    }

    return NextResponse.json({
      hasAttempted: true,
      attemptId: attempt.id,
      score: attempt.score
    });
  } catch (error) {
    console.error("Error checking attempt:", error);
    return NextResponse.json(
      { error: "Failed to check attempt" },
      { status: 500 }
    );
  }
}
