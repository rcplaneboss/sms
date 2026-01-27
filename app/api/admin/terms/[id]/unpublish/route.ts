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

    const term = await prisma.academicTerm.update({
      where: { id },
      data: { 
        isPublished: false, 
        publishedAt: null, 
        publishedBy: null 
      }
    });

    return NextResponse.json({ term });
  } catch (error) {
    return NextResponse.json({ error: "Failed to unpublish term" }, { status: 500 });
  }
}