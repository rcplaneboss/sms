import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let action: string | undefined;
  
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    action = body.action;
    const { userIds } = body;

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "Action and userIds array are required" },
        { status: 400 }
      );
    }

    // Prevent admin from performing bulk actions on themselves
    if (userIds.includes(session.user.id)) {
      return NextResponse.json(
        { error: "You cannot perform bulk actions on your own account" },
        { status: 400 }
      );
    }

    let result;
    const currentTime = new Date();

    switch (action) {
      case "ACTIVATE":
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { 
            updatedAt: currentTime,
          },
        });
        break;

      case "SUSPEND":
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { 
            updatedAt: currentTime,
          },
        });
        break;

      case "DELETE":
        // First, get the users to be deleted to ensure we don't delete admins
        const usersToDelete = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, role: true, email: true },
        });

        // Filter out admin users
        const nonAdminUsers = usersToDelete.filter(user => user.role !== "ADMIN");
        const nonAdminUserIds = nonAdminUsers.map(user => user.id);

        if (nonAdminUserIds.length === 0) {
          return NextResponse.json(
            { error: "Cannot delete admin users" },
            { status: 400 }
          );
        }

        // Delete related records first to avoid foreign key constraints
        await prisma.studentProfile.deleteMany({
          where: { userId: { in: nonAdminUserIds } },
        });
        
        await prisma.teacherProfile.deleteMany({
          where: { userId: { in: nonAdminUserIds } },
        });
        
        await prisma.application.deleteMany({
          where: { userId: { in: nonAdminUserIds } },
        });
        
        await prisma.enrollment.deleteMany({
          where: { studentId: { in: nonAdminUserIds } },
        });
        
        await prisma.attempt.deleteMany({
          where: { userId: { in: nonAdminUserIds } },
        });
        
        await prisma.exam.deleteMany({
          where: { createdById: { in: nonAdminUserIds } },
        });

        // Now delete the users
        result = await prisma.user.deleteMany({
          where: { id: { in: nonAdminUserIds } },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Supported actions: ACTIVATE, SUSPEND, DELETE" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Bulk ${action.toLowerCase()} completed successfully`,
      affectedCount: result.count,
    });
  } catch (error) {
    console.error(`Error performing bulk ${action}:`, error);
    return NextResponse.json(
      { error: `Failed to perform bulk ${action?.toLowerCase()}` },
      { status: 500 }
    );
  }
}