import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            type: true
          }
        },
        createdBy: { select: { name: true, id: true } },
        attempts: {
          where: { userId: session.user.id },
          select: { id: true, score: true, createdAt: true }
        }
      }
    });

    if (!exam) {
      return NextResponse.json(
        { error: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Only creator can edit
    if (exam.createdById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title } = await req.json();

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: { title: title.trim() },
      include: {
        questions: true,
        createdBy: { select: { name: true } }
      }
    });

    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { error: "Failed to update exam" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.exam.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { error: "Failed to delete exam" },
      { status: 500 }
    );
  }
}
