import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: {
        StudentProfile: {
          select: {
            fullName: true,
            phoneNumber: true,
            dateOfBirth: true,
          },
        },
        TeacherProfile: {
          select: {
            fullName: true,
            phoneNumber: true,
            acceptedTerms: true,
          },
        },
        enrollments: {
          include: {
            program: {
              select: {
                name: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add status field based on user activity and profile completion
    const usersWithStatus = users.map(user => {
      let status = "ACTIVE";
      
      // Determine status based on role and profile completion
      if (user.role === "TEACHER" && user.TeacherProfile && !user.TeacherProfile.acceptedTerms) {
        status = "PENDING";
      }
      
      // Add last login simulation (you can implement actual last login tracking)
      const lastLogin = new Date(user.updatedAt || user.createdAt);
      const daysSinceLogin = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLogin > 30) {
        status = "INACTIVE";
      }
      
      return {
        ...user,
        status,
        lastLogin: lastLogin.toISOString(),
      };
    });

    return NextResponse.json({ users: usersWithStatus });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password, role, studentProfile, teacherProfile } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
        { status: 400 }
      );
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Enhanced password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with profile data
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    // Add profile data based on role
    if (role === "STUDENT" && studentProfile) {
      userData.StudentProfile = {
        create: {
          fullName: studentProfile.fullName,
          phoneNumber: studentProfile.phoneNumber,
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
      userData.TeacherProfile = {
        create: {
          fullName: teacherProfile.fullName,
          phoneNumber: teacherProfile.phoneNumber,
          address: teacherProfile.address,
          highestDegree: teacherProfile.highestDegree,
          experienceYears: teacherProfile.experienceYears || 0,
          bio: teacherProfile.bio,
          equipment: teacherProfile.equipment,
          certifications: [],
          languages: [],
          techSkills: [],
          acceptedTerms: false,
        },
      };
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        StudentProfile: true,
        TeacherProfile: true,
      },
    });

    // Log user creation activity
    await prisma.activityLog.create({
      data: {
        action: "USER_CREATED",
        details: `User ${user.email} (${user.role}) created by admin ${session.user.email}`,
        userId: user.id,
        performedBy: session.user.id,
      },
    }).catch(() => {}); // Ignore if ActivityLog table doesn't exist

    return NextResponse.json({ 
      message: "User created successfully", 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        StudentProfile: user.StudentProfile,
        TeacherProfile: user.TeacherProfile,
      } 
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}