import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all results
    const results = await prisma.attempt.findMany({
      include: {
        exam: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching admin results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
