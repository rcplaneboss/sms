import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import * as z from "zod";

const gradeSchema = z.object({
  studentId: z.string().uuid(),
  subjectId: z.string().uuid(),
  programId: z.string().uuid(),
  term: z.enum(["FIRST", "SECOND", "THIRD", "FOURTH"]),
  continuousAssessment: z.number().min(0).max(40).optional(),
  examination: z.number().min(0).max(60).optional(),
  teacherComment: z.string().optional(),
});

function calculateGrade(total: number): string {
  if (total >= 80) return "A";
  if (total >= 70) return "B";
  if (total >= 60) return "C";
  if (total >= 50) return "D";
  return "F";
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");
    const subjectId = searchParams.get("subjectId");
    const term = searchParams.get("term");

    let whereClause: any = {};
    
    if (session.user.role === "TEACHER") {
      // Teachers can only see grades for subjects they teach
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });
      
      if (!teacherProfile) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
      }

      const assignments = await prisma.teacherAssignment.findMany({
        where: { teacherProfileId: teacherProfile.id },
        select: { subjectId: true, programId: true }
      });

      const teacherSubjectPrograms = assignments.map(a => ({
        subjectId: a.subjectId,
        programId: a.programId
      }));

      whereClause.OR = teacherSubjectPrograms.map(tsp => ({
        subjectId: tsp.subjectId,
        programId: tsp.programId
      }));
    }

    if (programId) whereClause.programId = programId;
    if (subjectId) whereClause.subjectId = subjectId;
    if (term) whereClause.term = term;

    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: {
          select: { id: true, name: true, email: true }
        },
        subject: {
          select: { id: true, name: true }
        },
        program: {
          select: { id: true, name: true, level: { select: { name: true } } }
        },
        teacher: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { program: { name: "asc" } },
        { subject: { name: "asc" } },
        { student: { name: "asc" } }
      ]
    });

    return NextResponse.json({ grades });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !["TEACHER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = gradeSchema.parse(body);
    const { studentId, subjectId, programId, term, continuousAssessment, examination, teacherComment } = validatedData;

    // Verify teacher can grade this subject/program
    if (session.user.role === "TEACHER") {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!teacherProfile) {
        return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
      }

      const assignment = await prisma.teacherAssignment.findFirst({
        where: {
          teacherProfileId: teacherProfile.id,
          subjectId,
          programId
        }
      });

      if (!assignment) {
        return NextResponse.json({ error: "Not authorized to grade this subject/program" }, { status: 403 });
      }
    }

    // Calculate total score and grade
    const ca = continuousAssessment || 0;
    const exam = examination || 0;
    const totalScore = ca + exam;
    const grade = calculateGrade(totalScore);

    const gradeRecord = await prisma.grade.upsert({
      where: {
        studentId_subjectId_programId_term: {
          studentId,
          subjectId,
          programId,
          term
        }
      },
      update: {
        continuousAssessment: ca,
        examination: exam,
        totalScore,
        grade,
        teacherComment,
        gradedBy: session.user.id,
        updatedAt: new Date()
      },
      create: {
        studentId,
        subjectId,
        programId,
        term,
        continuousAssessment: ca,
        examination: exam,
        totalScore,
        grade,
        teacherComment,
        teacherId: session.user.role === "TEACHER" ? session.user.id : null,
        gradedBy: session.user.id
      }
    });

    return NextResponse.json({ grade: gradeRecord }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    console.error("Error creating/updating grade:", error);
    return NextResponse.json({ error: "Failed to save grade" }, { status: 500 });
  }
}