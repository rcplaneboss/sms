import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find programs the student is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: session.user.id },
      select: { programId: true },
    });

    const programIds = enrollments.map((e) => e.programId);

    if (programIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch exams for those programs and include whether the student already attempted
    const exams = await prisma.exam.findMany({
      where: { programId: { in: programIds } },
      include: {
        questions: { select: { id: true, text: true, type: true, options: true } },
        attempts: { where: { userId: session.user.id }, select: { id: true, score: true } },
        program: { select: { id: true, name: true } },
        level: { select: { id: true, name: true } },
        track: { select: { id: true, name: true } },
      },
    });

    // Filter exams to only those where the student has a verified payment/application
    const eligible: any[] = [];
    for (const exam of exams) {
      const application = await prisma.application.findFirst({
        where: { userId: session.user.id, programId: exam.programId },
        select: { paymentStatus: true },
      });

      if (application && application.paymentStatus === "VERIFIED") {
        eligible.push(exam);
      }
    }

    return NextResponse.json(eligible);
  } catch (error) {
    console.error("Error fetching eligible exams:", error);
    return NextResponse.json({ error: "Failed to fetch eligible exams" }, { status: 500 });
  }
}
