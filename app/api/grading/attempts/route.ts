import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !["TEACHER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        submittedAt: { not: null }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        exam: {
          select: {
            title: true,
            examType: true,
            term: true
          }
        }
      },
      orderBy: {
        submittedAt: "desc"
      }
    });

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("Error fetching attempts:", error);
    return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
  }
}