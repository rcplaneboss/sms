import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

// GET student classes - this is a simplified endpoint
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");

    if (!programId) {
      return NextResponse.json({ students: [] });
    }

    // Get all students enrolled in the specified program
    const enrollments = await prisma.enrollment.findMany({
      where: {
        programId,
        status: "Active"
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const students = enrollments.map(enrollment => enrollment.student);

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching student classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes." },
      { status: 500 }
    );
  }
}
