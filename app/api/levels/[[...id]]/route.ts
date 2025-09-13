import { z } from 'zod';
import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { levelSchema } from '@/prisma/schema'; 

// GET /api/levels
export async function GET() {
  try {
    const levels = await prisma.level.findMany();
    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/levels
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = levelSchema.parse(body);

    const newLevel = await prisma.level.create({
      data: validatedData,
    });
    return NextResponse.json(newLevel, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid data provided', errors: error.issues }, { status: 400 });
    }
    console.error('Error creating level:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/levels/[id]
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    const body = await req.json();

    if (!id) return NextResponse.json({ message: 'Level ID is required' }, { status: 400 });

    const validatedData = levelSchema.parse(body);

    const updatedLevel = await prisma.level.update({
      where: { id },
      data: validatedData,
    });
    return NextResponse.json(updatedLevel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid data provided', errors: error.issues }, { status: 400 });
    }
    console.error('Error updating level:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/levels/[id]
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) return NextResponse.json({ message: 'Level ID is required' }, { status: 400 });

    await prisma.level.delete({ where: { id } });
    return NextResponse.json({ message: 'Level deleted successfully' });
  } catch (error) {
    console.error('Error deleting level:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}