import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// GET student applications
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: session.user.id,
        type: "STUDENT",
      },
      include: {
        program: { select: { name: true, id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching student applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications." },
      { status: 500 }
    );
  }
}
