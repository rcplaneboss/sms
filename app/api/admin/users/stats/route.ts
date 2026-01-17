import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get comprehensive user statistics
    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      usersByRole,
      usersByStatus,
      recentRegistrations,
      topActiveUsers,
      userGrowthData
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active users (logged in within last 30 days)
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // New users this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true
        }
      }),
      
      // Users by status (simulated)
      prisma.user.findMany({
        select: {
          id: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          TeacherProfile: {
            select: {
              acceptedTerms: true
            }
          }
        }
      }),
      
      // Recent registrations (last 10)
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          StudentProfile: {
            select: {
              fullName: true
            }
          },
          TeacherProfile: {
            select: {
              fullName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),
      
      // Top active users (by exam attempts/creations)
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          StudentProfile: {
            select: {
              fullName: true
            }
          },
          TeacherProfile: {
            select: {
              fullName: true
            }
          },
          _count: {
            select: {
              attempts: true,
              exams: true
            }
          }
        },
        orderBy: [
          {
            attempts: {
              _count: 'desc'
            }
          },
          {
            exams: {
              _count: 'desc'
            }
          }
        ],
        take: 10
      }),
      
      // User growth data (last 6 months)
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: {
          id: true
        },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Process status data
    const statusCounts = usersByStatus.reduce((acc, user) => {
      let status = "ACTIVE";
      
      if (user.role === "TEACHER" && user.TeacherProfile && !user.TeacherProfile.acceptedTerms) {
        status = "PENDING";
      }
      
      const daysSinceLogin = Math.floor((Date.now() - new Date(user.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLogin > 30) {
        status = "INACTIVE";
      }
      
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Process growth data by month
    const growthByMonth = userGrowthData.reduce((acc, item) => {
      const month = new Date(item.createdAt).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Calculate growth rate
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);
    const currentMonthUsers = growthByMonth[currentMonth] || 0;
    const lastMonthUsers = growthByMonth[lastMonth] || 0;
    const growthRate = lastMonthUsers > 0 ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;

    const stats = {
      overview: {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        growthRate: Math.round(growthRate * 100) / 100,
        inactiveUsers: totalUsers - activeUsers
      },
      
      demographics: {
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        
        byStatus: statusCounts
      },
      
      activity: {
        recentRegistrations: recentRegistrations.map(user => ({
          id: user.id,
          name: user.StudentProfile?.fullName || user.TeacherProfile?.fullName || user.name || 'No Name',
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        })),
        
        topActiveUsers: topActiveUsers.map(user => ({
          id: user.id,
          name: user.StudentProfile?.fullName || user.TeacherProfile?.fullName || user.name || 'No Name',
          email: user.email,
          role: user.role,
          totalActivity: user._count.attempts + user._count.exams,
          examAttempts: user._count.attempts,
          examsCreated: user._count.exams
        }))
      },
      
      growth: {
        monthlyData: Object.entries(growthByMonth).map(([month, count]) => ({
          month,
          users: count
        })).sort((a, b) => a.month.localeCompare(b.month))
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}