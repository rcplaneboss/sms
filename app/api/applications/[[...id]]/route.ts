import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { prisma } from "@/prisma";
import * as z from "zod";
import { sendEmail } from "@/lib/nodemailer";


// This schema validates the incoming request body for updating an application.
const updateSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  message: z.string(),
});


// GET /api/applications
// Retrieves all pending teacher applications with user and vacancy details.
export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      where: {
        type: "TEACHER",
        status: "PENDING",
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
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/applications/[id]
// Updates an application's status and sends an email to the user.
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { message: "Application ID is required" },
        { status: 400 }
      );
    }

    const validatedData = updateSchema.parse(body);

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: validatedData.status,
      },
      include: {
        user: true,
      },
    });

    if (validatedData.status === "APPROVED") {
      // Update the user's role to TEACHER
      await prisma.user.update({
        where: { id: updatedApplication.userId },
        data: { role: Role.TEACHER },
      });
    }

    // Now send the email
    const emailSubject =
      validatedData.status === "APPROVED"
        ? "Application Approved"
        : "Application Update";
    await sendEmail(
      // updatedApplication.user.email,
      "qosimabdulrahman0@gmail.com",
      emailSubject,
      validatedData.message
    );

    return NextResponse.json(updatedApplication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating application:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
