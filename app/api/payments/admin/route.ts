import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

// GET - Fetch all pending payments for admin
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Only admins can access this
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // PENDING, SUBMITTED, VERIFIED, REJECTED

    const whereClause = status ? { status } : {};

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        application: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            program: true,
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
