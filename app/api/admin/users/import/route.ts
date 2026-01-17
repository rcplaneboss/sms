import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { users } = await req.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "Users array is required" },
        { status: 400 }
      );
    }

    const results = {
      successful: [],
      failed: [],
      total: users.length
    };

    for (const userData of users) {
      try {
        const { name, email, password, role, studentProfile, teacherProfile } = userData;

        // Validation
        if (!email || !password || !role) {
          results.failed.push({
            email: email || "Unknown",
            error: "Email, password, and role are required"
          });
          continue;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          results.failed.push({
            email,
            error: "Invalid email format"
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          results.failed.push({
            email,
            error: "User already exists"
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Prepare user data
        const userCreateData: any = {
          name,
          email,
          password: hashedPassword,
          role,
        };

        // Add profile data based on role
        if (role === "STUDENT" && studentProfile) {
          userCreateData.StudentProfile = {
            create: {
              fullName: studentProfile.fullName || name || email,
              phoneNumber: studentProfile.phoneNumber || "",
              dateOfBirth: studentProfile.dateOfBirth ? new Date(studentProfile.dateOfBirth) : new Date(),
              age: studentProfile.age || "0",
              gender: studentProfile.gender || "Not specified",
              address: studentProfile.address || "",
              guardianName: studentProfile.guardianName,
              guardianContact: studentProfile.guardianContact,
              previousEducation: studentProfile.previousEducation,
            },
          };
        }

        if (role === "TEACHER" && teacherProfile) {
          userCreateData.TeacherProfile = {
            create: {
              fullName: teacherProfile.fullName || name || email,
              phoneNumber: teacherProfile.phoneNumber || "",
              address: teacherProfile.address || "",
              highestDegree: teacherProfile.highestDegree,
              experienceYears: teacherProfile.experienceYears || 0,
              bio: teacherProfile.bio,
              equipment: teacherProfile.equipment,
              certifications: teacherProfile.certifications || [],
              languages: teacherProfile.languages || [],
              techSkills: teacherProfile.techSkills || [],
              acceptedTerms: false,
            },
          };
        }

        // Create user
        const user = await prisma.user.create({
          data: userCreateData,
        });

        results.successful.push({
          id: user.id,
          email: user.email,
          role: user.role
        });

      } catch (error) {
        results.failed.push({
          email: userData.email || "Unknown",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    return NextResponse.json({
      message: `Import completed. ${results.successful.length} users created, ${results.failed.length} failed.`,
      results
    });

  } catch (error) {
    console.error("Error importing users:", error);
    return NextResponse.json(
      { error: "Failed to import users" },
      { status: 500 }
    );
  }
}