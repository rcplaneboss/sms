import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  UserSchema,
  teacherProfileSchema,
  teacherApplicationSchema,
} from "@/prisma/schema";
import path from "path";
import { writeFile } from "fs/promises";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "account" | "profile" | "application"

    const formData = await req.formData();

    if (type === "account") {
      const rawData: Record<string, any> = {};
      formData.forEach((value, key) => (rawData[key] = value));

      const data = UserSchema.parse(rawData);

      const user = await prisma.user.create({
        data: {
          name:  data.username,
          email: data.email,
          role: "TEACHER",
          password: data.password, 
        },
      });

      return NextResponse.json({ user });
    }

    if (type === "profile") {
      const userId = formData.get("userId") as string | null;
      if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
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
            connect: {
              id: formData.get("userId") as string,
            },
          },
        },
      });

      return NextResponse.json({ profile });
    }

    if (type === "application") {
      const userId = formData.get("userId") as string | null;
      if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
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
         { error: "Missing vacancyId" },
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

      return NextResponse.json({ application });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
