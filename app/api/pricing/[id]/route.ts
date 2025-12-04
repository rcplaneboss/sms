import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";

// GET pricing by program ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const pricing = await prisma.pricing.findUnique({
      where: { programId: id },
      include: {
        program: {
          include: {
            level: true,
            track: true,
          },
        },
      },
    });

    if (!pricing) {
      return NextResponse.json(
        { error: "Pricing not found for this program." },
        { status: 404 }
      );
    }

    return NextResponse.json(pricing, { status: 200 });
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing" },
      { status: 500 }
    );
  }
}

// PUT update pricing by program ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Only admins can update pricing
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const {
      amount,
      currency,
      billingCycle,
      description,
      discountPercent,
      discountEndDate,
      isActive,
    } = body;

    // Check if pricing exists
    const existingPricing = await prisma.pricing.findUnique({
      where: { programId: id },
    });

    if (!existingPricing) {
      return NextResponse.json(
        { error: "Pricing not found for this program." },
        { status: 404 }
      );
    }

    const pricing = await prisma.pricing.update({
      where: { programId: id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(currency && { currency }),
        ...(billingCycle && { billingCycle }),
        ...(description !== undefined && { description }),
        ...(discountPercent !== undefined && {
          discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        }),
        ...(discountEndDate !== undefined && {
          discountEndDate: discountEndDate ? new Date(discountEndDate) : null,
        }),
        ...(isActive !== undefined && { isActive }),
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

    return NextResponse.json(pricing, { status: 200 });
  } catch (error) {
    console.error("Error updating pricing:", error);
    return NextResponse.json(
      { error: "Failed to update pricing" },
      { status: 500 }
    );
  }
}

// DELETE pricing by program ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Only admins can delete pricing
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if pricing exists
    const existingPricing = await prisma.pricing.findUnique({
      where: { programId: id },
    });

    if (!existingPricing) {
      return NextResponse.json(
        { error: "Pricing not found for this program." },
        { status: 404 }
      );
    }

    await prisma.pricing.delete({
      where: { programId: id },
    });

    return NextResponse.json(
      { message: "Pricing deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting pricing:", error);
    return NextResponse.json(
      { error: "Failed to delete pricing" },
      { status: 500 }
    );
  }
}
