
import { NextResponse } from "next/server";
import { prisma } from "@/prisma"; 
import * as z from "zod";

// Zod schema for validation
const pricingPlanSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  amountMinor: z.number().int().positive({ message: "Amount must be a positive integer." }),
  currency: z.string().length(3, { message: "Currency must be a 3-letter code (e.g., NGN)." }),
  intervalMonths: z.number().int().positive({ message: "Interval must be a positive integer (months)." }),
  active: z.boolean().default(true),
});

// GET /api/admin/pricing
// Retrieves all pricing plans
export async function GET() {
  try {
    const pricingPlans = await prisma.pricingPlan.findMany();
    return NextResponse.json(pricingPlans);
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/pricing
// Creates a new pricing plan
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = pricingPlanSchema.parse(body);

    const newPricingPlan = await prisma.pricingPlan.create({
      data: validatedData,
    });

    return NextResponse.json(newPricingPlan, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating pricing plan:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/pricing/[id]
// Updates an existing pricing plan
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const validatedData = pricingPlanSchema.parse(body);

    const updatedPricingPlan = await prisma.pricingPlan.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updatedPricingPlan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating pricing plan:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/pricing/[id]
// Deletes a pricing plan
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.pricingPlan.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Pricing plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting pricing plan:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}