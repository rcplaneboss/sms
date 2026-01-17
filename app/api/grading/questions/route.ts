import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !["TEACHER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const attemptId = searchParams.get("attemptId");

    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID required" }, { status: 400 });
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                options: true,
                grades: {
                  where: { attemptId }
                }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        questionGrades: true
      }
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    return NextResponse.json({ attempt });
  } catch (error) {
    console.error("Error fetching attempt details:", error);
    return NextResponse.json({ error: "Failed to fetch attempt" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !["TEACHER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId, questionId, marksAwarded, maxMarks, teacherComment } = await req.json();

    const questionGrade = await prisma.questionGrade.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId
        }
      },
      update: {
        marksAwarded,
        teacherComment,
        gradedBy: session.user.id
      },
      create: {
        attemptId,
        questionId,
        marksAwarded,
        maxMarks,
        teacherComment,
        gradedBy: session.user.id
      }
    });

    // Update attempt total score
    const totalMarks = await prisma.questionGrade.aggregate({
      where: { attemptId },
      _sum: { marksAwarded: true }
    });

    await prisma.attempt.update({
      where: { id: attemptId },
      data: { score: totalMarks._sum.marksAwarded || 0 }
    });

    return NextResponse.json({ questionGrade });
  } catch (error) {
    console.error("Error grading question:", error);
    return NextResponse.json({ error: "Failed to grade question" }, { status: 500 });
  }
}