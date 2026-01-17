import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import * as z from "zod";
import { sendEmail } from "@/lib/nodemailer";

// Validation schemas
const updateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  message: z.string(),
});

const scheduleSchema = z.object({
  message: z.string(),
});

// GET - Handle multiple purposes
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
    const programId = searchParams.get("programId");
    const userId = searchParams.get("userId");

    // Case 1: Check if user has an application for a program
    if (programId && userId) {
      // Only allow users to check their own applications
      if (userId !== session.user.id && session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Unauthorized." },
          { status: 403 }
        );
      }

      const application = await prisma.application.findFirst({
        where: {
          userId,
          programId,
          type: "STUDENT",
        },
      });

      return NextResponse.json(
        { application },
        { status: 200 }
      );
    }

    // Case 2: Get all teacher applications (for admin)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const applications = await prisma.application.findMany({
      where: {
        status: {
          in: ["PENDING", "INTERVIEW_SCHEDULED"],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        vacancy: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications." },
      { status: 500 }
    );
  }
}

// POST - Create application or schedule interview
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to apply." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { programId, type = "STUDENT", id, message } = body;

    // Case 1: Schedule interview for teacher application
    if (id && message) {
      if (session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Unauthorized. Admin access required." },
          { status: 403 }
        );
      }

      const validatedData = scheduleSchema.parse({ message });

      const updatedApplication = await prisma.application.update({
        where: { id },
        data: {
          status: "INTERVIEW_SCHEDULED",
        },
        include: {
          user: true,
        },
      });

      const emailSubject = "Interview Scheduled";
      try {
        await sendEmail(
          updatedApplication.user.email || "",
          emailSubject,
          validatedData.message
        );
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }

      return NextResponse.json(updatedApplication);
    }

    // Case 2: Create new student application for program
    if (!programId) {
      return NextResponse.json(
        { error: "Program ID is required." },
        { status: 400 }
      );
    }

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: { pricing: true },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found." },
        { status: 404 }
      );
    }

    // Check if user already has an application for this program
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: session.user.id,
        programId,
        type: "STUDENT",
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          error: "You have already applied for this program.",
          application: existingApplication,
        },
        { status: 409 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        programId,
        type: "STUDENT",
        status: "PENDING",
        paymentStatus: "PENDING",
      },
      include: {
        program: {
          include: {
            pricing: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully.",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to create application." },
      { status: 500 }
    );
  }
}

// PUT - Update application status
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const { status, message } = body;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required." },
        { status: 400 }
      );
    }

    const validatedData = updateSchema.parse({ status, message });

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: validatedData.status,
      },
      include: {
        user: true,
      },
    });

    // If approving a teacher application, update user role
    if (validatedData.status === "APPROVED" && updatedApplication.type === "TEACHER") {
      await prisma.user.update({
        where: { id: updatedApplication.userId },
        data: { role: "TEACHER" },
      });
    }

    // If approving a student application, create enrollment
    if (validatedData.status === "APPROVED" && updatedApplication.type === "STUDENT" && updatedApplication.programId) {
      await prisma.enrollment.create({
        data: {
          studentId: updatedApplication.userId,
          programId: updatedApplication.programId,
          status: "Active",
        },
      });
    }

    // Send email notification
    const emailSubject =
      validatedData.status === "APPROVED"
        ? "Application Approved"
        : "Application Update";
    try {
      await sendEmail(
        updatedApplication.user.email || "",
        emailSubject,
        validatedData.message
      );
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application." },
      { status: 500 }
    );
  }
}
