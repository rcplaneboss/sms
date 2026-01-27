import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find approved applications with verified payments
    const applications = await prisma.application.findMany({
      where: { 
        userId: session.user.id,
        status: "APPROVED",
        paymentStatus: "VERIFIED"
      },
      include: {
        payment: true,
        program: {
          include: {
            pricing: true
          }
        }
      },
    });

    // Filter applications with valid (non-expired) payments
    const now = new Date();
    const validProgramIds: string[] = [];

    for (const app of applications) {
      if (!app.payment || !app.program?.pricing) continue;

      const paymentDate = new Date(app.payment.updatedAt); // When payment was verified
      const billingCycle = app.program.pricing.billingCycle;
      
      let expiryDate = new Date(paymentDate);
      
      // Calculate expiry based on billing cycle
      if (billingCycle === "MONTHLY") {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (billingCycle === "QUARTERLY") {
        expiryDate.setMonth(expiryDate.getMonth() + 3);
      } else if (billingCycle === "ANNUALLY") {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else if (billingCycle === "ONE_TIME") {
        // One-time payment never expires
        expiryDate = new Date("2099-12-31");
      }

      // Check if payment is still valid
      if (now <= expiryDate) {
        validProgramIds.push(app.programId);
      }
    }

    if (validProgramIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch exams for valid programs with published terms only
    const exams = await prisma.exam.findMany({
      where: { 
        programId: { in: validProgramIds },
        OR: [
          { academicTerm: { isPublished: true } },
          { academicTermId: null }
        ]
      },
      include: {
        questions: { select: { id: true, text: true, type: true, options: true } },
        attempts: { where: { userId: session.user.id }, select: { id: true, score: true } },
        program: { select: { id: true, name: true } },
        level: { select: { id: true, name: true } },
        track: { select: { id: true, name: true } },
        createdBy: { select: { name: true } },
        academicTerm: { select: { name: true, year: true, isPublished: true } },
      },
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Error fetching eligible exams:", error);
    return NextResponse.json({ error: "Failed to fetch eligible exams" }, { status: 500 });
  }
}
