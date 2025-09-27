import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import * as z from "zod";

// Zod schema for POST request validation (Assignment creation)
const assignmentSchema = z.object({
  teacherId: z.string().uuid("Invalid teacher ID format."),
  courseId: z.string().uuid("Invalid course ID format."),
});

// Zod schema for DELETE request validation (Assignment removal)
const deleteAssignmentSchema = z.object({
  teacherId: z.string().uuid("Invalid teacher ID format."),
  courseId: z.string().uuid("Invalid course ID format."),
});

// GET /api/admin/assignments
// Retrieves all onboarded teachers, courses, AND current assignments for the dashboard.
export async function GET() {
  try {
    // 1. Fetch teachers who have completed their profile and accepted terms (onboarded)
    const teachers = await prisma.user.findMany({
      where: {
        role: "TEACHER",
        TeacherProfile: {
          is: {
            acceptedTerms: true,
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        // Select the TeacherProfile ID for internal use when managing assignments
        TeacherProfile: {
          select: { id: true }
        }
      },
      orderBy: { name: "asc" }
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
            level: { select: { name: true } }
          }
        },
      },
      orderBy: { name: "asc" }
    });

    // 3. Fetch all current assignments (TeacherProfile <-> Course connections)
    const currentAssignments = await prisma.teacherProfile.findMany({
      where: {
        coursesTaught: {
          some: {} // Exists at least one course in the many-to-many relationship
        }
      },
      select: {
        // Get user details associated with the profile
        user: {
          select: { id: true, name: true, email: true }
        },
        // Get the list of courses taught by this teacher
        coursesTaught: {
          select: {
            id: true,
            name: true,
            subject: { select: { name: true } }
          }
        }
      }
    });


    return NextResponse.json({ teachers, courses, currentAssignments }, { status: 200 });
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

// DELETE /api/admin/assignments
// Unassigns a course from a teacher by unlinking the Course from the TeacherProfile.
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const validatedData = deleteAssignmentSchema.parse(body);
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

    // Now, update the TeacherProfile to disconnect the Course
    await prisma.teacherProfile.update({
      where: { id: teacherProfile.id },
      data: {
        coursesTaught: {
          disconnect: { id: courseId },
        },
      },
    });

    return NextResponse.json(
      { message: "Course successfully unassigned from teacher." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided.", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error unassigning course:", error);
    return NextResponse.json(
      { message: "Internal Server Error during unassignment." },
      { status: 500 }
    );
  }
}
