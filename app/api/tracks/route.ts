import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { trackSchema } from "@/prisma/schema";

// GET /api/tracks
export async function GET() {
  try {
    const tracks = await prisma.track.findMany();
    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/tracks
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = trackSchema.parse(body);

    const newTrack = await prisma.track.create({
      data: validatedData,
    });
    return NextResponse.json(newTrack, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating track:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/tracks/[id]
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const body = await req.json();

    if (!id)
      return NextResponse.json(
        { message: "Track ID is required" },
        { status: 400 }
      );

    const validatedData = trackSchema.parse(body);

    const updatedTrack = await prisma.track.update({
      where: { id },
      data: validatedData,
    });
    return NextResponse.json(updatedTrack);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating track:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/tracks/[id]
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id)
      return NextResponse.json(
        { message: "Track ID is required" },
        { status: 400 }
      );

    await prisma.track.delete({ where: { id } });
    return NextResponse.json({ message: "Track deleted successfully" });
  } catch (error) {
    console.error("Error deleting track:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
