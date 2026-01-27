import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const exams = await prisma.exam.findMany({
      where: {
        AND: [
          {
            OR: [
              { academicTerm: { isPublished: true } },
              { academicTermId: null }
            ]
          },
          // Only show published individual exams
          // { isPublished: true }
        ]
      },
      include: {
        questions: {
          select: { id: true, text: true, type: true, options: true }
        },
        attempts: {
          where: { userId: session.user.id },
          select: { id: true, score: true }
        },
        program: { select: { name: true, } },
        level: { select: { name: true } },  
        track: { select: { name: true } },
        createdBy: {
          select: { name: true }
        },
        academicTerm: {
          select: { name: true, year: true, isPublished: true }
        }
      }
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Only teachers and admins can create exams
    if (!session?.user || !['TEACHER', 'ADMIN'].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, programId, levelId, trackId, subjectId, duration, examType, academicTermId } = await req.json();

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!programId || !levelId || !trackId || !subjectId) {
      return NextResponse.json(
        { error: "Program, Level, and Track are required" },
        { status: 400 }
      );
    }

    // Get the current active term
    const activeTerm = await prisma.academicTerm.findFirst({
      where: { isActive: true }
    });

    const exam = await prisma.exam.create({
      data: {
        title: title.trim(),
        programId: programId,
        levelId: levelId,
        trackId: trackId,
        subjectId: subjectId,
        duration: duration || 60,
        examType: examType || 'EXAM',
        term: 'FIRST', // Keep for backward compatibility
        isPublished: false, 
        createdById: session.user.id,
        academicTermId: academicTermId || activeTerm?.id
      },
      include: {
        questions: true,
        createdBy: { select: { name: true } },
        program: { select: { id: true, name: true } },
        level: { select: { id: true, name: true } },
        track: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}
