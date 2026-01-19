import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, year, startDate, endDate, isActive } = await request.json();

    if (isActive) {
      await prisma.academicTerm.updateMany({
        where: { isActive: true, id: { not: id } },
        data: { isActive: false }
      });
    }

    const term = await prisma.academicTerm.update({
      where: { id },
      data: {
        name,
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive
      }
    });

    return NextResponse.json({ term });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update term" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const examCount = await prisma.exam.count({
      where: { academicTermId: id }
    });

    if (examCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete term with associated exams" },
        { status: 400 }
      );
    }

    await prisma.academicTerm.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete term" }, { status: 500 });
  }
}