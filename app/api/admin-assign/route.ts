import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import * as z from "zod";

const assignmentSchema = z.object({
  teacherId: z.string().uuid("Invalid teacher ID format."),
  subjectId: z.string().uuid("Invalid subject ID format."),
  programId: z.string().uuid("Invalid program ID format."),
});

const deleteAssignmentSchema = z.object({
  teacherId: z.string().uuid("Invalid teacher ID format."),
  subjectId: z.string().uuid("Invalid subject ID format."),
});

export async function GET() {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: "TEACHER",
        TeacherProfile: {
          acceptedTerms: true,
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        TeacherProfile: {
          select: { id: true }
        }
      },
      orderBy: { name: "asc" }
    });

    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        programs: {
          select: {
            id: true,
            name: true,
            level: { select: { name: true } },
            track: { select: { name: true } }
          }
        },
      },
      orderBy: { name: "asc" }
    });

    const currentAssignments = await prisma.teacherProfile.findMany({
      where: {
        assignments: {
          some: {}
        }
      },
      select: {
        user: {
          select: { id: true, name: true, email: true }
        },
        assignments: {
          select: {
            subject: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            program: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    const programs = await prisma.program.findMany({
      select: {
        id: true,
        name: true,
        level: { select: { name: true } },
        track: { select: { name: true } }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ teachers, subjects, programs, currentAssignments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignment data:", error);
    return NextResponse.json(
      { message: "Internal Server Error during data fetching." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = assignmentSchema.parse(body);
    const { teacherId, subjectId, programId } = validatedData;

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

    await prisma.teacherAssignment.create({
      data: {
        teacherProfileId: teacherProfile.id,
        subjectId: subjectId,
        programId: programId,
      },
    });

    return NextResponse.json(
      { message: "Subject successfully assigned to teacher." },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided.", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error assigning subject:", error);
    return NextResponse.json(
      { message: "Internal Server Error during assignment." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const validatedData = deleteAssignmentSchema.parse(body);
    const { teacherId, subjectId } = validatedData;

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

    // Delete the specific assignment
    await prisma.teacherAssignment.deleteMany({
      where: {
        teacherProfileId: teacherProfile.id,
        subjectId: subjectId,
      },
    });

    return NextResponse.json(
      { message: "Subject successfully unassigned from teacher." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided.", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error unassigning subject:", error);
    return NextResponse.json(
      { message: "Internal Server Error during unassignment." },
      { status: 500 }
    );
  }
}
