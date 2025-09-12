import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  UserSchema,
  teacherProfileSchema,
  teacherApplicationSchema,
} from "@/prisma/schema";
import path from "path";
import { writeFile } from "fs/promises";
import { ZodError } from "zod";
import bcrypt from "bcryptjs"; // Import bcryptjs for password hashing

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "account" | "profile" | "application"

    if (!type) {
      return NextResponse.json(
        { error: "Request type is required." },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    /**
     * --- ACCOUNT CREATION ---
     */
    if (type === "account") {
      const rawData: Record<string, any> = {};
      formData.forEach((value, key) => (rawData[key] = value));

      const data = UserSchema.parse(rawData);

      // check if email already exists
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        return NextResponse.json(
          { error: "This email is already registered." },
          { status: 409 }
        );
      }

      // Hash the password before creating the user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      const user = await prisma.user.create({
        data: {
          name: data.username,
          email: data.email,
          role: "ADMIN",
          password: hashedPassword, // Use the hashed password here
        },
      });

      return NextResponse.json({
        message: "Account created successfully.",
        user,
      });
    }

    /**
     * --- TEACHER PROFILE ---
     */
    if (type === "profile") {
      const userId = formData.get("userId") as string | null;
      if (!userId) {
        return NextResponse.json(
          { error: "Missing userId in profile submission." },
          { status: 400 }
        );
      }

      const rawData: Record<string, any> = {};
      formData.forEach((value, key) => {
        if (key !== "userId") rawData[key] = value;
      });

      const data = teacherProfileSchema.parse(rawData);

      const profile = await prisma.teacherProfile.create({
        data: {
          ...data,
          user: {
            connect: { id: userId },
          },
        },
      });

      return NextResponse.json({
        message: "Profile saved successfully.",
        profile,
      });
    }

    /**
     * --- APPLICATION ---
     */
    if (type === "application") {
      const userId = formData.get("userId") as string | null;
      if (!userId) {
        return NextResponse.json(
          { error: "Missing userId in application." },
          { status: 400 }
        );
      }

      const resume = formData.get("resume") as File | null;
      const certificates = formData.get("certificates") as File | null;

      const rawData: Record<string, any> = {};
      formData.forEach((value, key) => {
        if (!["resume", "certificates", "userId"].includes(key)) {
          rawData[key] = value;
        }
      });

      const vacancyId = formData.get("vacancyId");
      if (!vacancyId || typeof vacancyId !== "string") {
        return NextResponse.json(
          { error: "Missing vacancyId in application." },
          { status: 400 }
        );
      }
      rawData.vacancyId = vacancyId;

      ["certifications", "languages", "techSkills"].forEach((field) => {
        if (rawData[field] && typeof rawData[field] === "string") {
          rawData[field] = rawData[field]
            .split(",")
            .map((s: string) => s.trim());
        }
      });

      const data = teacherApplicationSchema.parse(rawData);

      let resumePath: string | null = null;
      let certificatesPath: string | null = null;

      if (resume) {
        const bytes = await resume.arrayBuffer();
        const buffer = Buffer.from(bytes);
        resumePath = path.join(
          process.cwd(),
          "uploads",
          `${Date.now()}-${resume.name}`
        );
        await writeFile(resumePath, buffer);
      }

      if (certificates) {
        const bytes = await certificates.arrayBuffer();
        const buffer = Buffer.from(bytes);
        certificatesPath = path.join(
          process.cwd(),
          "uploads",
          `${Date.now()}-${certificates.name}`
        );
        await writeFile(certificatesPath, buffer);
      }

      const application = await prisma.application.create({
        data: {
          type: "TEACHER",
          userId,
          vacancyId: data.vacancyId,
          details: {
            ...data,
            resume: resumePath,
            certificates: certificatesPath,
          },
          status: "PENDING",
        },
      });

      return NextResponse.json({
        message: "Application submitted successfully.",
        application,
      });
    }

    return NextResponse.json(
      { error: "Invalid request type." },
      { status: 400 }
    );
  } catch (err) {
    console.error("❌ Error in teacher route:", err);

    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed.",
          details: err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
