import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, role, status } = await req.json();
    const { id: userId } = await params;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
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

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already taken by another user" },
        { status: 400 }
      );
    }

    // Get current user data for logging
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true, name: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        role,
        updatedAt: new Date(),
      },
    });

    // Log user update activity
    const changes = [];
    if (currentUser.name !== name) changes.push(`name: ${currentUser.name} → ${name}`);
    if (currentUser.email !== email) changes.push(`email: ${currentUser.email} → ${email}`);
    if (currentUser.role !== role) changes.push(`role: ${currentUser.role} → ${role}`);
    
    if (changes.length > 0) {
      await prisma.activityLog.create({
        data: {
          action: "USER_UPDATED",
          details: `User ${currentUser.email} updated by admin ${session.user.email}. Changes: ${changes.join(', ')}`,
          userId: userId,
          performedBy: session.user.id,
        },
      }).catch(() => {}); // Ignore if ActivityLog table doesn't exist
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;

    // Prevent admin from deleting themselves
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists and get user data for logging
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deletion of other admin users
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot delete admin users" },
        { status: 400 }
      );
    }

    // Delete user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Log user deletion activity
    await prisma.activityLog.create({
      data: {
        action: "USER_DELETED",
        details: `User ${user.email} (${user.role}) deleted by admin ${session.user.email}`,
        userId: userId,
        performedBy: session.user.id,
      },
    }).catch(() => {}); // Ignore if ActivityLog table doesn't exist

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        attempts: {
          include: {
            exam: {
              select: {
                title: true,
                createdAt: true,
              },
            },
          },
          orderBy: { startedAt: "desc" },
          take: 10,
        },
        exams: {
          select: {
            title: true,
            createdAt: true,
            _count: {
              select: {
                attempts: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            attempts: true,
            exams: true,
            enrollments: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add status based on user activity and profile completion
    let status = "ACTIVE";
    if (user.role === "TEACHER" && user.TeacherProfile && !user.TeacherProfile.acceptedTerms) {
      status = "PENDING";
    }
    
    const lastLogin = new Date(user.updatedAt || user.createdAt);
    const daysSinceLogin = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLogin > 30) {
      status = "INACTIVE";
    }

    const userWithStatus = {
      ...user,
      status,
      lastLogin: lastLogin.toISOString(),
    };

    return NextResponse.json({ user: userWithStatus });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}