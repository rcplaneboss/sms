import {prisma} from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type");

  try {
    if (type === "profile") {
      const formData = await req.formData();

      // Validate required fields
      if (!formData.get("fullName") || !formData.get("userId")) {
        return NextResponse.json(
          { success: false, message: "Full name and userId are required" },
          { status: 400 }
        );
      }

      const studentProfile = await prisma.studentProfile.create({
        data: {
          fullName: formData.get("fullName") as string,
          gender: formData.get("gender") as string,
          age: formData.get("age") as string,
          dateOfBirth: new Date(formData.get("dateOfBirth") as string),
          phoneNumber: formData.get("phoneNumber") as string,
          address: formData.get("address") as string,
          guardianName: formData.get("guardianName") as string,
          guardianContact: formData.get("guardianNumber") as string,
          previousEducation: (formData.get("previousEducation") as string) || "",
          user: {
            connect: {
              id: formData.get("userId") as string,
            },
          },
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Profile created successfully",
          studentProfile,
        },
        { status: 201 }
      );
    }

    if (type === "account") {
      const formData = await req.formData();

      const userName = formData.get("username") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const role = formData.get("role") as string;

      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: "Email and password are required" },
          { status: 400 }
        );
      }

      const isUser = await prisma.user.findUnique({
        where: { email },
      });

      if (isUser) {
        return NextResponse.json(
          { success: false, message: "User with this email already exists" },
          { status: 409 } 
        );
      }

      const user = await prisma.user.create({
        data: {
          email,
          password: await bcrypt.hash(password, 10),
          name: userName,
          role: role ?? "STUDENT",
        },
      });

      return NextResponse.json(
        { success: true, message: "Account created successfully", user },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid request type" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in POST handler:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined, 
      },
      { status: 500 }
    );
  }
}
