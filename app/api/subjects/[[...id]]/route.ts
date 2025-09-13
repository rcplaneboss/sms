import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { subjectSchema } from "@/prisma/schema";


// GET /api/subjects
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany();
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/subjects
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = subjectSchema.parse(body);

    const newSubject = await prisma.subject.create({
      data: validatedData,
    });
    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/subjects/[id]
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const body = await req.json();

    if (!id)
      return NextResponse.json(
        { message: "Subject ID is required" },
        { status: 400 }
      );
    const validatedData = subjectSchema.parse(body);

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: validatedData,
    });
    return NextResponse.json(updatedSubject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating subject:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/subjects/[id]
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id)
      return NextResponse.json(
        { message: "Subject ID is required" },
        { status: 400 }
      );

    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
