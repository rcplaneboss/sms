import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import {
  sendPaymentApprovedEmail,
  sendPaymentRejectedEmail,
} from "@/lib/emails";

interface RouteParams {
  params: Promise<{ paymentId: string }>;
}

// PUT - Approve or reject a payment (admin only)
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();

    // Only admins can approve/reject payments
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { paymentId } = await params;
    const body = await req.json();
    const { status, approvalNotes } = body;

    // Validate status
    if (!["VERIFIED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be either VERIFIED or REJECTED." },
        { status: 400 }
      );
    }

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found." },
        { status: 404 }
      );
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        approvedBy: session.user.id,
        approvalNotes,
        approvedAt: new Date(),
      },
      include: {
        application: {
          include: {
            user: true,
            program: true,
          },
        },
      },
    });

    // If approved, update application payment status to VERIFIED
    if (status === "VERIFIED") {
      await prisma.application.update({
        where: { id: payment.applicationId },
        data: {
          paymentStatus: "VERIFIED",
        },
      });

      // Create enrollment for the student
      if (updatedPayment.application.programId) {
        await prisma.enrollment.upsert({
          where: {
            studentId_programId: {
              studentId: updatedPayment.application.userId,
              programId: updatedPayment.application.programId,
            },
          },
          create: {
            studentId: updatedPayment.application.userId,
            programId: updatedPayment.application.programId,
            status: "Active",
          },
          update: {
            status: "Active",
          },
        });
      }

      // Send approval email
      try {
        await sendPaymentApprovedEmail({
          studentName: updatedPayment.application.user.name || "Student",
          studentEmail: updatedPayment.application.user.email || "",
          programName: updatedPayment.application.program.name,
          amount: Number(updatedPayment.amount),
          currency: updatedPayment.currency,
        });
      } catch (emailError) {
        console.error("Error sending payment approval email:", emailError);
      }
    } else if (status === "REJECTED") {
      // If rejected, keep payment status as REJECTED so user can resubmit
      await prisma.application.update({
        where: { id: payment.applicationId },
        data: {
          paymentStatus: "REJECTED",
        },
      });

      // Send rejection email
      try {
        await sendPaymentRejectedEmail({
          studentName: updatedPayment.application.user.name || "Student",
          studentEmail: updatedPayment.application.user.email || "",
          programName: updatedPayment.application.program.name,
          amount: Number(updatedPayment.amount),
          currency: updatedPayment.currency,
          reason: approvalNotes || "Please contact support for more information.",
        });
      } catch (emailError) {
        console.error("Error sending payment rejection email:", emailError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Payment ${status === "VERIFIED" ? "approved" : "rejected"} successfully.`,
        payment: updatedPayment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment status." },
      { status: 500 }
    );
  }
}

// GET - Fetch a specific payment (admin and owner only)
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { paymentId } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
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
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found." },
        { status: 404 }
      );
    }

    // Only allow admin or payment owner to view
    if (session.user.role !== "ADMIN" && payment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 403 }
      );
    }

    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment." },
      { status: 500 }
    );
  }
}
