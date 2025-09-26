import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { ZodError, z } from "zod";
import { auth } from '@/auth';


// Zod schema to validate the incoming request body
const onboardingSchema = z.object({
  bankName: z.string().min(1),
  accountName: z.string().min(1),
  accountNumber: z.string().min(1),
  termsAccepted: z.boolean().refine((val) => val === true),
});

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    // Validate the request body
    const validatedData = onboardingSchema.parse(body);

      const session = auth();
    const userId = session?.user?.id;       

    // Find the teacher's profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { message: "Teacher profile not found." },
        { status: 404 }
      );
    }

    // Update the teacher profile to show terms have been accepted
    await prisma.teacherProfile.update({
      where: { id: teacherProfile.id },
      data: {
        acceptedTerms: validatedData.termsAccepted,
        // Upsert the payment information
        paymentInfo: {
          upsert: {
            create: {
              bankName: validatedData.bankName,
              accountName: validatedData.accountName,
              accountNumber: validatedData.accountNumber,
            },
            update: {
              bankName: validatedData.bankName,
              accountName: validatedData.accountName,
              accountNumber: validatedData.accountNumber,
            },
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Teacher onboarding data saved successfully." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid data provided", errors: error.issues },
        { status: 400 }
      );
    }
    console.error("Error saving teacher onboarding data:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
