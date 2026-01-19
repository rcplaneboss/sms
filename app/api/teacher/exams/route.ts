import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        programs: {
          include: {
            subjects: true,
            level: true,
            track: true
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Get all subject IDs from teacher's programs
    const subjectIds = teacher.programs.flatMap(program => 
      program.subjects.map(subject => subject.id)
    );

    const exams = await prisma.exam.findMany({
      where: {
        subjectId: {
          in: subjectIds
        }
      },
      include: {
        academicTerm: true,
        program: true,
        subject: true,
        level: true,
        track: true,
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Error fetching teacher exams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}