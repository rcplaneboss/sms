import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { courseSchema } from "@/prisma/schema";


// GET /api/courses
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: { subject: true },
    });
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/courses
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = courseSchema.parse(body);

    const newCourse = await prisma.course.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        subject: {
          connect: { id: validatedData.subjectId },
        },
      },
    });
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating course:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id]
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const body = await req.json();

    if (!id)
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    const validatedData = courseSchema.parse(body);

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        subjectId: validatedData.subjectId,
      },
    });
    return NextResponse.json(updatedCourse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating course:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id]
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id)
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );

    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

