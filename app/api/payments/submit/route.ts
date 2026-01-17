import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { sendPaymentSubmittedEmail } from "@/lib/emails";

// POST - Submit payment proof for an application
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to submit payment." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("receipt") as File;
    const applicationId = formData.get("applicationId") as string;

    console.log("Payment submission:", { 
      hasFile: !!file, 
      fileType: file?.type,
      fileSize: file?.size,
      applicationId 
    });

    // Validate inputs
    if (!file || !applicationId) {
      return NextResponse.json(
        { error: "Receipt file and application ID are required." },
        { status: 400 }
      );
    }

    // Validate file type (accept PDF and images)
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and image files (JPEG, PNG, WebP) are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must not exceed 5MB." },
        { status: 400 }
      );
    }

    // Check if application exists and belongs to user
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        program: {
          include: {
            pricing: true,
          },
        },
      },
    });

    console.log("Application found:", {
      exists: !!application,
      userId: application?.userId,
      sessionUserId: session.user.id,
      hasPayment: !!application?.payment,
      hasPricing: !!application?.program?.pricing,
      pricingActive: application?.program?.pricing?.isActive
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    if (application.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only submit payment for your own application." },
        { status: 403 }
      );
    }

    // Check if application already has a payment
    if (application.payment) {
      return NextResponse.json(
        { error: "Payment already submitted for this application." },
        { status: 409 }
      );
    }

    // Check if pricing exists
    if (!application.program?.pricing || !application.program.pricing.isActive) {
      return NextResponse.json(
        { error: "Pricing is not available for this program." },
        { status: 400 }
      );
    }

    // Save file to public/uploads/payments
    const fileName = `${uuidv4()}_${Date.now()}_${file.name}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "payments");
    
    try {
      await mkdir(uploadDir, { recursive: true });
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(join(uploadDir, fileName), buffer);
    } catch (fileError) {
      console.error("Error saving file:", fileError);
      return NextResponse.json(
        { error: "Failed to save receipt file." },
        { status: 500 }
      );
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        applicationId,
        userId: session.user.id,
        amount: application.program.pricing.amount,
        currency: application.program.pricing.currency,
        receiptUrl: `/uploads/payments/${fileName}`,
        receiptFileName: file.name,
        status: "SUBMITTED",
      },
      include: {
        application: {
          include: {
            program: true,
          },
        },
      },
    });

    // Update application payment status
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        paymentStatus: "SUBMITTED",
      },
    });

    // Send confirmation email
    try {
      await sendPaymentSubmittedEmail({
        studentName: session.user.name || "Student",
        studentEmail: session.user.email || "",
        programName: application.program?.name || "Your Program",
        amount: Number(application.program?.pricing?.amount || 0),
        currency: application.program?.pricing?.currency || "NGN",
      });
    } catch (emailError) {
      console.error("Error sending payment submission email:", emailError);
      // Don't fail the payment submission if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment proof submitted successfully. Awaiting admin verification.",
        payment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting payment:", error);
    return NextResponse.json(
      { error: "Failed to submit payment. Please try again." },
      { status: 500 }
    );
  }
}

// GET - Check payment status for an application
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required." },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { applicationId },
      include: {
        application: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { payment: null },
        { status: 200 }
      );
    }

    // Only allow users to see their own payments
    if (payment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 403 }
      );
    }

    return NextResponse.json(payment, { status: 200 });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment status." },
      { status: 500 }
    );
  }
}
