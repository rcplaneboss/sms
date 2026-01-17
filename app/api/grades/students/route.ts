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
    const programId = searchParams.get("programId");
    const subjectId = searchParams.get("subjectId");

    if (!programId || !subjectId) {
      return NextResponse.json({ error: "Program ID and Subject ID are required" }, { status: 400 });
    }

    // Verify teacher can access this subject/program
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
        return NextResponse.json({ error: "Not authorized to access this subject/program" }, { status: 403 });
      }
    }

    // Get students enrolled in the program with their exam attempts
    const enrollments = await prisma.enrollment.findMany({
      where: {
        programId,
        status: "Active"
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            StudentProfile: {
              select: {
                fullName: true
              }
            },
            attempts: {
              where: {
                exam: {
                  programId,
                  subjectId
                }
              },
              include: {
                exam: {
                  select: {
                    id: true,
                    title: true,
                    term: true
                  }
                }
              },
              orderBy: {
                startedAt: "desc"
              }
            }
          }
        },
        program: {
          select: {
            id: true,
            name: true,
            level: { select: { name: true } },
            track: { select: { name: true } }
          }
        }
      },
      orderBy: {
        student: { name: "asc" }
      }
    });

    const students = enrollments.map(e => ({
      id: e.student.id,
      name: e.student.name || e.student.StudentProfile?.fullName || e.student.email,
      email: e.student.email,
      examAttempts: e.student.attempts.map(attempt => ({
        id: attempt.id,
        examTitle: attempt.exam.title,
        term: attempt.exam.term,
        score: attempt.score,
        submittedAt: attempt.submittedAt,
        startedAt: attempt.startedAt
      }))
    }));

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true, name: true }
    });

    return NextResponse.json({
      students,
      program: enrollments[0]?.program,
      subject
    });
  } catch (error) {
    console.error("Error fetching students for grading:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}