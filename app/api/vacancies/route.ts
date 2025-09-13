import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import * as z from "zod";


// This schema defines the validation for the API body, expecting requirements as an array.
const vacancySchema = z.object({
  title: z.string().min(1, { message: "Job title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  requirements: z.array(z.string()).optional(),
  location: z.string().min(1, { message: "Location is required." }),
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
});

// GET /api/vacancies
// Retrieves all vacancies.
export async function GET() {
  try {
    const vacancies = await prisma.vacancy.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(vacancies);
  } catch (error) {
    console.error("Error fetching vacancies:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/vacancies
// Creates a new vacancy.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = vacancySchema.parse(body);

    const newVacancy = await prisma.vacancy.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        requirements: validatedData.requirements || [],
        location: validatedData.location,
        type: validatedData.type,
      },
    });

    return NextResponse.json(newVacancy, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating vacancy:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/vacancies/[id]
// Updates an existing vacancy.
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Vacancy ID is required" },
        { status: 400 }
      );
    }

    const validatedData = vacancySchema.parse(body);

    const updatedVacancy = await prisma.vacancy.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        requirements: validatedData.requirements || [],
        location: validatedData.location,
        type: validatedData.type,
      },
    });

    return NextResponse.json(updatedVacancy);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating vacancy:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/vacancies/[id]
// Deletes a vacancy.
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { message: "Vacancy ID is required" },
        { status: 400 }
      );
    }

    await prisma.vacancy.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Vacancy deleted successfully" });
  } catch (error) {
    console.error("Error deleting vacancy:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
