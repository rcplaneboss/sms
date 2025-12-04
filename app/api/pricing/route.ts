import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

// GET all pricing
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Only admins can view all pricing
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const pricing = await prisma.pricing.findMany({
      include: {
        program: {
          include: {
            level: true,
            track: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pricing, { status: 200 });
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing" },
      { status: 500 }
    );
  }
}

// POST create new pricing
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Only admins can create pricing
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      programId,
      amount,
      currency = "NGN",
      billingCycle = "ANNUAL",
      description,
      discountPercent,
      discountEndDate,
    } = body;

    // Validation
    if (!programId || !amount) {
      return NextResponse.json(
        { error: "Program ID and amount are required." },
        { status: 400 }
      );
    }

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found." },
        { status: 404 }
      );
    }

    // Check if pricing already exists for this program
    const existingPricing = await prisma.pricing.findUnique({
      where: { programId },
    });

    if (existingPricing) {
      return NextResponse.json(
        { error: "Pricing already exists for this program. Use update instead." },
        { status: 409 }
      );
    }

    const pricing = await prisma.pricing.create({
      data: {
        programId,
        amount: parseFloat(amount),
        currency,
        billingCycle,
        description,
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        discountEndDate: discountEndDate ? new Date(discountEndDate) : null,
      },
      include: {
        program: {
          include: {
            level: true,
            track: true,
          },
        },
      },
    });

    return NextResponse.json(pricing, { status: 201 });
  } catch (error) {
    console.error("Error creating pricing:", error);
    return NextResponse.json(
      { error: "Failed to create pricing" },
      { status: 500 }
    );
  }
}
