import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;
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

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { examId: true }
    });

    if (!question || question.examId !== id) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const { text, options } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Update the question text
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        text: text.trim(),
      },
      include: {
        options: {
          select: {
            id: true,
            text: true,
            isCorrect: true,
          },
        },
      },
    });

    // If options provided, update them
    if (options && Array.isArray(options)) {
      try {
        // Delete existing options that are not in the update
        const existingOptionIds = updatedQuestion.options.map(o => o.id);
        const incomingOptionIds = options.filter(o => o.id && !o.id.includes('new')).map(o => o.id);
        
        const optionsToDelete = existingOptionIds.filter(id => !incomingOptionIds.includes(id));
        if (optionsToDelete.length > 0) {
          await prisma.questionOption.deleteMany({
            where: { id: { in: optionsToDelete } }
          });
        }

        // Create or update options
        for (const opt of options) {
          if (opt.id && !opt.id.includes('new')) {
            // Update existing option
            await prisma.questionOption.update({
              where: { id: opt.id },
              data: {
                text: opt.text.trim(),
                isCorrect: opt.isCorrect,
              },
            });
          } else if (!opt.id || opt.id.includes('new')) {
            // Create new option
            await prisma.questionOption.create({
              data: {
                text: opt.text.trim(),
                isCorrect: opt.isCorrect,
                questionId: questionId,
              },
            });
          }
        }
      } catch (optError) {
        console.warn("Warning: Could not update question options. Database schema may not be migrated yet.", optError);
      }
    }

    // Fetch updated question with options
    const finalQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: {
          select: {
            id: true,
            text: true,
            isCorrect: true,
          },
        },
      },
    });

    return NextResponse.json(finalQuestion);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id, questionId } = await params;
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

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { examId: true }
    });

    if (!question || question.examId !== id) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Delete the question (options will cascade delete due to onDelete: Cascade)
    await prisma.question.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
