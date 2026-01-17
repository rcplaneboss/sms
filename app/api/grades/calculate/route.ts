import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !["TEACHER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId, subjectId, programId, term } = await req.json();

    if (!studentId || !subjectId || !programId || !term) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get CA and Exam attempts for this student, subject, program, and term
    const caAttempts = await prisma.attempt.findMany({
      where: {
        userId: studentId,
        exam: {
          subjectId,
          programId,
          term,
          examType: "CA"
        }
      },
      include: {
        questionGrades: true
      }
    });

    const examAttempts = await prisma.attempt.findMany({
      where: {
        userId: studentId,
        exam: {
          subjectId,
          programId,
          term,
          examType: "EXAM"
        }
      },
      include: {
        questionGrades: true
      }
    });

    // Calculate average CA score (max 40)
    let caScore = 0;
    if (caAttempts.length > 0) {
      const totalCaScore = caAttempts.reduce((sum, attempt) => {
        const attemptScore = attempt.questionGrades.reduce((qSum, grade) => qSum + grade.marksAwarded, 0);
        const maxScore = attempt.questionGrades.reduce((qSum, grade) => qSum + grade.maxMarks, 0);
        return sum + (maxScore > 0 ? (attemptScore / maxScore) * 100 : 0);
      }, 0);
      caScore = Math.min((totalCaScore / caAttempts.length) * 0.4, 40); // Scale to 40%
    }

    // Calculate average Exam score (max 60)
    let examScore = 0;
    if (examAttempts.length > 0) {
      const totalExamScore = examAttempts.reduce((sum, attempt) => {
        const attemptScore = attempt.questionGrades.reduce((qSum, grade) => qSum + grade.marksAwarded, 0);
        const maxScore = attempt.questionGrades.reduce((qSum, grade) => qSum + grade.maxMarks, 0);
        return sum + (maxScore > 0 ? (attemptScore / maxScore) * 100 : 0);
      }, 0);
      examScore = Math.min((totalExamScore / examAttempts.length) * 0.6, 60); // Scale to 60%
    }

    console.log(`Student ${studentId}, Subject ${subjectId}:`);
    console.log(`CA Attempts: ${caAttempts.length}, CA Score: ${caScore}`);
    console.log(`Exam Attempts: ${examAttempts.length}, Exam Score: ${examScore}`);

    const totalScore = caScore + examScore;
    
    // Calculate letter grade
    let letterGrade = "F";
    if (totalScore >= 80) letterGrade = "A";
    else if (totalScore >= 70) letterGrade = "B";
    else if (totalScore >= 60) letterGrade = "C";
    else if (totalScore >= 50) letterGrade = "D";

    // Create or update grade record
    const grade = await prisma.grade.upsert({
      where: {
        studentId_subjectId_programId_term: {
          studentId,
          subjectId,
          programId,
          term
        }
      },
      update: {
        continuousAssessment: caScore,
        examination: examScore,
        totalScore,
        grade: letterGrade,
        teacherId: session.user.id,
        gradedBy: session.user.id
      },
      create: {
        studentId,
        subjectId,
        programId,
        term,
        continuousAssessment: caScore,
        examination: examScore,
        totalScore,
        grade: letterGrade,
        teacherId: session.user.id,
        gradedBy: session.user.id
      },
      include: {
        student: { select: { name: true } },
        subject: { select: { name: true } }
      }
    });

    return NextResponse.json({ grade });
  } catch (error) {
    console.error("Error calculating grade:", error);
    return NextResponse.json({ error: "Failed to calculate grade" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const programId = searchParams.get("programId");
    const term = searchParams.get("term");

    const grades = await prisma.grade.findMany({
      where: {
        ...(studentId && { studentId }),
        ...(programId && { programId }),
        ...(term && { term })
      },
      include: {
        student: { select: { name: true, email: true } },
        subject: { select: { name: true } },
        program: { select: { name: true } }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json({ grades });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 });
  }
}