import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Fetch statistics
    const [
      totalStudents,
      totalTeachers,
      totalPrograms,
      totalApplications,
      pendingApplications,
      pendingPayments,
      verifiedPayments,
      recentApplications,
      recentPayments,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.program.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: "PENDING" } }),
      prisma.payment.count({ where: { status: { in: ["PENDING", "SUBMITTED"] } } }),
      prisma.payment.count({ where: { status: "VERIFIED" } }),
      prisma.application.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          program: { select: { name: true } },
        },
      }),
      prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          application: {
            include: {
              user: { select: { name: true } },
              program: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalPrograms,
      totalApplications,
      pendingApplications,
      pendingPayments,
      verifiedPayments,
      recentApplications,
      recentPayments,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data." },
      { status: 500 }
    );
  }
}
