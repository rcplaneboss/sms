import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get exams created by this teacher
    const exams = await prisma.exam.findMany({
      where: {
        createdById: session.user.id
      },
      include: {
        academicTerm: {
          select: {
            name: true,
            year: true,
            isPublished: true
          }
        },
        program: { select: { name: true } },
        subject: { select: { name: true } },
        level: { select: { name: true } },
        track: { select: { name: true } },
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Error fetching teacher exams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}