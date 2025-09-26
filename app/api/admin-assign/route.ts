import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import * as z from "zod";

// Zod schema for POST request validation (Assignment)
const assignmentSchema = z.object({
  teacherId: z.string().uuid("Invalid teacher ID format."),
  courseId: z.string().uuid("Invalid course ID format."),
});

// GET /api/admin/assignments
// Retrieves all onboarded teachers and courses needed for the assignment page.
export async function GET() {
  try {
    // 1. Fetch teachers who have completed their profile and accepted terms (onboarded)
    const teachers = await prisma.user.findMany({
      where: {
        role: "TEACHER",
        TeacherProfile: {
          is: {
            // Only include teachers who have a profile AND accepted the terms.
            acceptedTerms: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    // 2. Fetch all courses with necessary context for display
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        subject: { select: { name: true } },
        programs: {
          select: {
            name: true,
            level: { select: { name: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ teachers, courses }, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignment data:", error);
    return NextResponse.json(
      { message: "Internal Server Error during data fetching." },
      { status: 500 }
    );
  }
}

// POST /api/admin/assignments
// Assigns a course to a teacher by linking the Course to the TeacherProfile.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = assignmentSchema.parse(body);
    const { teacherId, courseId } = validatedData;

    // First, find the TeacherProfile ID using the User ID
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: teacherId },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { message: "Teacher profile not found for the given user." },
        { status: 404 }
      );
    }

    // Now, update the TeacherProfile to connect the new Course
    await prisma.teacherProfile.update({
      where: { id: teacherProfile.id },
      data: {
        coursesTaught: {
          connect: { id: courseId },
        },
      },
    });

    return NextResponse.json(
      { message: "Course successfully assigned to teacher." },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided.", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error assigning course:", error);
    return NextResponse.json(
      { message: "Internal Server Error during assignment." },
      { status: 500 }
    );
  }
}
