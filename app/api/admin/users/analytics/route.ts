import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user statistics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    // Get user registration trends (last 12 months)
    const registrationTrends = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Process registration trends by month
    const monthlyRegistrations = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const count = registrationTrends.filter(trend => {
        const trendDate = new Date(trend.createdAt);
        const trendKey = `${trendDate.getFullYear()}-${String(trendDate.getMonth() + 1).padStart(2, '0')}`;
        return trendKey === monthKey;
      }).reduce((sum, trend) => sum + trend._count.id, 0);

      return {
        month: monthKey,
        count,
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      };
    }).reverse();

    // Get top performing students (by exam attempts)
    const topStudents = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        _count: {
          select: {
            attempts: true,
          },
        },
        StudentProfile: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        attempts: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // Get teacher activity (by exams created)
    const teacherActivity = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      include: {
        _count: {
          select: {
            exams: true,
          },
        },
        TeacherProfile: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        exams: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // Get recent user activities
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        StudentProfile: {
          select: { fullName: true },
        },
        TeacherProfile: {
          select: { fullName: true },
        },
      },
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        growthRate: monthlyRegistrations.length > 1 
          ? ((monthlyRegistrations[monthlyRegistrations.length - 1].count - monthlyRegistrations[monthlyRegistrations.length - 2].count) / Math.max(monthlyRegistrations[monthlyRegistrations.length - 2].count, 1)) * 100
          : 0,
      },
      usersByRole: usersByRole.map(role => ({
        role: role.role,
        count: role._count.id,
      })),
      registrationTrends: monthlyRegistrations,
      topStudents: topStudents.map(student => ({
        id: student.id,
        name: student.StudentProfile?.fullName || student.name || student.email,
        email: student.email,
        examsTaken: student._count.attempts,
      })),
      teacherActivity: teacherActivity.map(teacher => ({
        id: teacher.id,
        name: teacher.TeacherProfile?.fullName || teacher.name || teacher.email,
        email: teacher.email,
        examsCreated: teacher._count.exams,
      })),
      recentUsers: recentUsers.map(user => ({
        id: user.id,
        name: user.StudentProfile?.fullName || user.TeacherProfile?.fullName || user.name || user.email,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}