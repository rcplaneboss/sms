import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { score, answers } = await req.json();

    // Verify the attempt belongs to the current user
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId }
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the attempt with score
    const updatedAttempt = await prisma.attempt.update({
      where: { id: attemptId },
      data: { score: score }
    });

    return NextResponse.json(updatedAttempt);
  } catch (error) {
    console.error("Error updating attempt:", error);
    return NextResponse.json(
      { error: "Failed to update attempt" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: { select: { title: true, questions: true } },
        user: { select: { name: true, email: true } }
      }
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Only the student or admin can view the attempt
    if (attempt.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempt" },
      { status: 500 }
    );
  }
}
