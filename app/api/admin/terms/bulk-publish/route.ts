import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { termIds, action } = await request.json();

    if (!termIds || !Array.isArray(termIds) || termIds.length === 0) {
      return NextResponse.json({ error: "Term IDs are required" }, { status: 400 });
    }

    if (!action || !["publish", "unpublish"].includes(action)) {
      return NextResponse.json({ error: "Valid action is required" }, { status: 400 });
    }

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

    const result = await prisma.academicTerm.updateMany({
      where: { id: { in: termIds } },
      data: updateData
    });

    return NextResponse.json({ 
      message: `${result.count} terms ${action}ed successfully`,
      count: result.count 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to bulk update terms" }, { status: 500 });
  }
}