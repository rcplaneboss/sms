import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import * as z from "zod";


// Define the Zod schema for the API body validation, now including course and subject IDs.
const programSchema = z.object({
  name: z.string().min(1, { message: "Program name is required." }),
  description: z.string().optional(),
  levelId: z.string().min(1, { message: "Level ID is required." }),
  trackId: z.string().min(1, { message: "Track ID is required." }),
 
  subjectIds: z.array(z.string()).optional(),
});

// GET /api/admin/programs
// Retrieves all programs, including their related levels, tracks, courses, and subjects.
export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      include: {
        level: true,
        track: true,
      
        subjects: true, // Include the related subjects
      },
    });
    return NextResponse.json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/programs
// Creates a new program and connects it to the selected courses and subjects.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = programSchema.parse(body);

    const newProgram = await prisma.program.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        levelId: validatedData.levelId,
        trackId: validatedData.trackId,
        // Connect to courses and subjects if IDs are provided
       
        subjects: {
          connect: validatedData.subjectIds?.map((id) => ({ id })),
        },
      },
    });

    return NextResponse.json(newProgram, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating program:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/programs/[id]
// Updates an existing program and its associated courses and subjects.
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Program ID is required" },
        { status: 400 }
      );
    }

    const validatedData = programSchema.parse(body);

    const updatedProgram = await prisma.program.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        levelId: validatedData.levelId,
        trackId: validatedData.trackId,
        
        subjects: {
          set: validatedData.subjectIds?.map((id) => ({ id })),
        },
      },
    });

    return NextResponse.json(updatedProgram);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating program:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/programs/[id]
// Deletes a program.
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { message: "Program ID is required" },
        { status: 400 }
      );
    }

    await prisma.program.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
