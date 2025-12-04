import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

// GET - Fetch all payments for the logged-in student
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        application: {
          include: {
            program: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(payments, { status: 200 });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments." },
      { status: 500 }
    );
  }
}
