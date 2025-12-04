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

    // Get teacher profile with courses
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        coursesTaught: {
          include: {
            subject: { select: { name: true } },
            _count: { select: { attempts: true } },
          },
        },
      },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher profile not found." },
        { status: 404 }
      );
    }

    // Count total students across all courses (approximate)
    const studentCount = await prisma.attempt.findMany({
      where: {
        exam: {
          createdById: session.user.id,
        },
      },
      distinct: ["userId"],
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

    return NextResponse.json({
      assignedCourses: teacherProfile.coursesTaught.length,
      totalStudents: studentCount.length,
      pendingGrades,
      courses: teacherProfile.coursesTaught,
    });
  } catch (error) {
    console.error("Error fetching teacher dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data." },
      { status: 500 }
    );
  }
}
