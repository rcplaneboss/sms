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

    const { action, users } = await req.json();

    if (action === "import") {
      if (!users || !Array.isArray(users)) {
        return NextResponse.json(
          { error: "Users array is required for import" },
          { status: 400 }
        );
      }

      const results = {
        successful: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const userData of users) {
        try {
          const { name, email, role, password, ...profileData } = userData;

          // Validate required fields
          if (!email || !role || !password) {
            results.failed++;
            results.errors.push(`Missing required fields for ${email || 'unknown user'}`);
            continue;
          }

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            results.failed++;
            results.errors.push(`User with email ${email} already exists`);
            continue;
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 12);

          // Create user data
          const createData: any = {
            name,
            email,
            password: hashedPassword,
            role,
          };

          // Add profile data based on role
          if (role === "STUDENT" && profileData.fullName) {
            createData.StudentProfile = {
              create: {
                fullName: profileData.fullName,
                phoneNumber: profileData.phoneNumber || "",
                dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : new Date(),
                age: profileData.age || "0",
                gender: profileData.gender || "Not specified",
                address: profileData.address || "",
                guardianName: profileData.guardianName,
                guardianContact: profileData.guardianContact,
                previousEducation: profileData.previousEducation,
              },
            };
          }

          if (role === "TEACHER" && profileData.fullName) {
            createData.TeacherProfile = {
              create: {
                fullName: profileData.fullName,
                phoneNumber: profileData.phoneNumber || "",
                address: profileData.address,
                highestDegree: profileData.highestDegree,
                experienceYears: parseInt(profileData.experienceYears) || 0,
                bio: profileData.bio,
                equipment: profileData.equipment,
                certifications: [],
                languages: [],
                techSkills: [],
                acceptedTerms: false,
              },
            };
          }

          await prisma.user.create({
            data: createData,
          });

          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Failed to create user ${userData.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return NextResponse.json({
        message: `Import completed. ${results.successful} users created, ${results.failed} failed.`,
        results,
      });
    }

    if (action === "export") {
      const users = await prisma.user.findMany({
        include: {
          StudentProfile: true,
          TeacherProfile: true,
          enrollments: {
            include: {
              program: {
                select: {
                  name: true,
                  level: { select: { name: true } },
                  track: { select: { name: true } },
                },
              },
            },
          },
          _count: {
            select: {
              attempts: true,
              exams: true,
            },
          },
        },
      });

      const exportData = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        fullName: user.StudentProfile?.fullName || user.TeacherProfile?.fullName || "",
        phoneNumber: user.StudentProfile?.phoneNumber || user.TeacherProfile?.phoneNumber || "",
        address: user.StudentProfile?.address || user.TeacherProfile?.address || "",
        dateOfBirth: user.StudentProfile?.dateOfBirth || "",
        age: user.StudentProfile?.age || "",
        gender: user.StudentProfile?.gender || "",
        guardianName: user.StudentProfile?.guardianName || "",
        guardianContact: user.StudentProfile?.guardianContact || "",
        previousEducation: user.StudentProfile?.previousEducation || "",
        highestDegree: user.TeacherProfile?.highestDegree || "",
        experienceYears: user.TeacherProfile?.experienceYears || "",
        bio: user.TeacherProfile?.bio || "",
        acceptedTerms: user.TeacherProfile?.acceptedTerms || false,
        programs: user.enrollments?.map(e => `${e.program.name} (${e.program.level.name} - ${e.program.track.name})`).join("; ") || "",
        examsTaken: user._count.attempts,
        examsCreated: user._count.exams,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return NextResponse.json({
        users: exportData,
        count: exportData.length,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: import, export" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in import/export:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}