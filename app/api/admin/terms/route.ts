import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const terms = await prisma.academicTerm.findMany({
      include: {
        _count: {
          select: { exams: true }
        }
      },
      orderBy: [{ year: "desc" }, { name: "asc" }]
    });

    return NextResponse.json({ terms });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch terms" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, year, startDate, endDate, isActive } = await request.json();

    // Check for existing term with same name and year
    const existingTerm = await prisma.academicTerm.findFirst({
      where: { name, year }
    });

    if (existingTerm) {
      return NextResponse.json(
        { error: `${name} Term for ${year} already exists` },
        { status: 400 }
      );
    }

    if (isActive) {
      await prisma.academicTerm.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const term = await prisma.academicTerm.create({
      data: {
        name,
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive
      }
    });

    return NextResponse.json({ term });
  } catch (error: any) {
    console.error("Error creating term:", error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A term with this name and year already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create term" }, { status: 500 });
  }
}