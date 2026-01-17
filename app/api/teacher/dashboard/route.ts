import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized. Teacher access required." },
        { status: 403 }
      );
    }

    // Get teacher profile with assignments
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        assignments: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            program: {
              include: {
                enrollments: {
                  include: {
                    student: {
                      select: {
                        id: true,
                        name: true,
                        email: true
                      }
                    }
                  }
                },
                level: { select: { name: true } },
                track: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher profile not found." },
        { status: 404 }
      );
    }

    // Get unique students across all programs
    const allStudents = new Set();
    teacherProfile.assignments.forEach(assignment => {
      assignment.program.enrollments.forEach(enrollment => {
        allStudents.add(enrollment.student.id);
      });
    });

    // Pending grades (attempts without scores)
    const pendingGrades = await prisma.attempt.count({
      where: {
        score: null,
        exam: {
          createdById: session.user.id,
        },
      },
    });

    // Group assignments by subject
    const subjectMap = new Map();
    teacherProfile.assignments.forEach(assignment => {
      const subjectId = assignment.subject.id;
      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, {
          id: assignment.subject.id,
          name: assignment.subject.name,
          programs: []
        });
      }
      subjectMap.get(subjectId).programs.push({
        id: assignment.program.id,
        name: assignment.program.name,
        level: assignment.program.level.name,
        track: assignment.program.track.name,
        studentCount: assignment.program.enrollments.length,
        students: assignment.program.enrollments.map(e => e.student)
      });
    });

    return NextResponse.json({
      assignedSubjects: subjectMap.size,
      totalStudents: allStudents.size,
      pendingGrades,
      subjects: Array.from(subjectMap.values())
    });
  } catch (error) {
    console.error("Error fetching teacher dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data." },
      { status: 500 }
    );
  }
}
