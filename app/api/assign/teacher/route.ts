import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const userId = await auth().then((session) => session?.user?.id);

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
      select: {
        assignments: {
          select: {
            subject: {
              select: {
                id: true,
                name: true
              }
            },
            program: {
              select: {
                id: true,
                name: true,
                level: { select: { name: true } },
                track: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { message: "Teacher profile not found." },
        { status: 404 }
      );
    }

    // Transform assignments to match expected frontend format
    const courses = teacherProfile.assignments.map(assignment => ({
      id: `${assignment.subject.id}-${assignment.program.id}`,
      name: `${assignment.subject.name} - ${assignment.program.name}`,
      subject: { 
        id: assignment.subject.id,
        name: assignment.subject.name 
      },
      programs: [{
        id: assignment.program.id,
        name: assignment.program.name,
        level: { name: assignment.program.level.name }
      }]
    }));

    return NextResponse.json(
      { courses },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching teacher assignments:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
