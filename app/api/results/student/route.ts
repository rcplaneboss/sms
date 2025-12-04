import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch results for current student
    const results = await prisma.attempt.findMany({
      where: { userId: session.user.id },
      include: {
        exam: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching student results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
