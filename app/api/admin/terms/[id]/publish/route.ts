import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();

    const updateData = action === "publish" 
      ? { 
          isPublished: true, 
          publishedAt: new Date(), 
          publishedBy: session.user.id 
        }
      : { 
          isPublished: false, 
          publishedAt: null, 
          publishedBy: null 
        };

    const term = await prisma.academicTerm.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ term });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update term" }, { status: 500 });
  }
}