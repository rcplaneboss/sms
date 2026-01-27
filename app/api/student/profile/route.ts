import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            enrollments: {
              include: {
                program: {
                  include: {
                    level: { select: { name: true } },
                    track: { select: { name: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Flatten the structure for easier frontend consumption
    const responseData = {
      ...profile,
      enrollments: profile.user.enrollments
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fullName, phoneNumber, address, guardianName, guardianContact, previousEducation } = await request.json();

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: session.user.id },
      data: {
        fullName,
        phoneNumber,
        address,
        guardianName,
        guardianContact,
        previousEducation,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}