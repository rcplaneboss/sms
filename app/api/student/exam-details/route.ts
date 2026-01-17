import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const attemptId = searchParams.get("attemptId");

    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID required" }, { status: 400 });
    }

    const attempt = await prisma.attempt.findUnique({
      where: { 
        id: attemptId,
        userId: session.user.id // Ensure student can only see their own attempts
      },
      include: {
        exam: {
          include: {
            subject: true,
            program: {
              include: {
                level: true,
                track: true
              }
            },
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
        questionGrades: true
      }
    });

    if (!attempt) {
      return NextResponse.json({ error: "Exam attempt not found" }, { status: 404 });
    }

    // Parse student answers
    const studentAnswers = attempt.answers as any || {};

    // Combine questions with grades and answers
    const questionsWithDetails = attempt.exam.questions.map(question => {
      const grade = question.grades[0];
      const studentAnswer = studentAnswers[question.id];
      
      return {
        id: question.id,
        text: question.text,
        type: question.type,
        marks: question.marks,
        options: question.options,
        studentAnswer,
        marksAwarded: grade?.marksAwarded || 0,
        maxMarks: grade?.maxMarks || question.marks,
        teacherComment: grade?.teacherComment,
        isCorrect: question.type === "MCQ" ? 
          question.options.find(opt => opt.isCorrect)?.id === studentAnswer :
          null
      };
    });

    return NextResponse.json({
      attempt: {
        ...attempt,
        exam: {
          ...attempt.exam,
          questions: questionsWithDetails
        }
      }
    });
  } catch (error) {
    console.error("Error fetching exam details:", error);
    return NextResponse.json({ error: "Failed to fetch exam details" }, { status: 500 });
  }
}