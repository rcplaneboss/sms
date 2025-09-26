import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const userId = await auth().then((session) => session?.user?.id);

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
      // Select the courses taught and related details necessary for the frontend display
      select: {
        coursesTaught: {
          select: {
            id: true,
            name: true,
            subject: {
              select: { name: true }, // Get the Subject name
            },
            programs: {
              // Get details about the program (e.g., JSS1 Mathematics -> JSS1 Program)
              select: {
                name: true,
                level: { select: { name: true } }, // Get the Level name (e.g., JSS)
              },
             
            },
          },
        },
      },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { message: "Teacher profile not found." },
        { status: 404 }
      );
    }

    // Return the list of courses
    return NextResponse.json(
      { courses: teacherProfile.coursesTaught },
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
