import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (userId) {
      where.OR = [
        { userId: userId },
        { performedBy: userId }
      ];
    }

    // Get activity logs (simulated since ActivityLog table might not exist)
    // In a real implementation, you would have an ActivityLog model
    const activities = await prisma.user.findMany({
      where: userId ? { id: userId } : {},
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        attempts: {
          select: {
            id: true,
            startedAt: true,
            submittedAt: true,
            exam: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { startedAt: "desc" },
          take: 10,
        },
        exams: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
    });

    // Transform to activity format
    const activityLogs = activities.flatMap(user => {
      const logs = [];
      
      // User creation
      logs.push({
        id: `user-created-${user.id}`,
        action: "USER_CREATED",
        description: `User account created`,
        userId: user.id,
        userEmail: user.email,
        timestamp: user.createdAt,
        type: "ACCOUNT",
      });

      // Exam attempts
      user.attempts.forEach(attempt => {
        logs.push({
          id: `attempt-${attempt.id}`,
          action: "EXAM_ATTEMPTED",
          description: `Attempted exam: ${attempt.exam.title}`,
          userId: user.id,
          userEmail: user.email,
          timestamp: attempt.startedAt,
          type: "EXAM",
        });
      });

      // Exams created (for teachers)
      user.exams.forEach(exam => {
        logs.push({
          id: `exam-created-${exam.id}`,
          action: "EXAM_CREATED",
          description: `Created exam: ${exam.title}`,
          userId: user.id,
          userEmail: user.email,
          timestamp: exam.createdAt,
          type: "EXAM",
        });
      });

      return logs;
    });

    // Sort by timestamp
    activityLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = activityLogs.length;
    const paginatedLogs = activityLogs.slice(0, limit);

    return NextResponse.json({
      activities: paginatedLogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch user activities" },
      { status: 500 }
    );
  }
}