import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all ungraded attempts from exams created by this teacher
    const attempts = await prisma.attempt.findMany({
      where: {
        exam: {
          createdById: session.user.id
        },
        score: null // Ungraded attempts
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        exam: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("Error fetching attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}
