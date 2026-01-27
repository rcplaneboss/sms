import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { examIds, termId } = await request.json();

    if (!examIds || !Array.isArray(examIds) || examIds.length === 0) {
      return NextResponse.json({ error: "Exam IDs are required" }, { status: 400 });
    }

    if (!termId) {
      return NextResponse.json({ error: "Term ID is required" }, { status: 400 });
    }

    // Verify the term exists
    const term = await prisma.academicTerm.findUnique({
      where: { id: termId }
    });

    if (!term) {
      return NextResponse.json({ error: "Term not found" }, { status: 404 });
    }

    const result = await prisma.exam.updateMany({
      where: { id: { in: examIds } },
      data: { academicTermId: termId }
    });

    return NextResponse.json({ 
      message: `${result.count} exams assigned to ${term.name} ${term.year}`,
      count: result.count 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to bulk assign exams to term" }, { status: 500 });
  }
}