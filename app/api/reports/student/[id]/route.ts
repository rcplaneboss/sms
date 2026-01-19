import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: studentId } = await params;
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term") || "FIRST";
    const year = searchParams.get("year") || "2024/2025";

    // Check if the requested term is published
    const academicTerm = await prisma.academicTerm.findFirst({
      where: { 
        name: term as any,
        year: year,
        isPublished: true
      }
    });

    if (!academicTerm && session.user.role === "STUDENT") {
      return NextResponse.json({ 
        error: "Report not available", 
        message: "This term's report is not yet published. Please check back later.",
        hasData: false
      }, { status: 403 });
    }

    // Get student data
    const student = await prisma.user.findUnique({
      where: { id: studentId, role: "STUDENT" },
      include: {
        StudentProfile: true,
        attempts: {
          include: {
            exam: {
              select: {
                title: true,
                duration: true,
                createdBy: {
                  select: {
                    name: true,
                    TeacherProfile: {
                      select: { fullName: true }
                    }
                  }
                }
              }
            }
          },
          orderBy: { startedAt: "desc" }
        },
        enrollments: {
          include: {
            program: {
              select: {
                name: true,
                level: { select: { name: true } },
                track: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // For now, since exam model doesn't have term field, simulate term-based data
    // Only show data for FIRST_TERM, return no data for others
    if (term !== "FIRST_TERM" || student.attempts.length === 0) {
      return NextResponse.json({ 
        error: "No data available", 
        message: `No exams, tests, or assessment data found for ${term.replace("_", " ").toLowerCase()}. Please check back later or contact your teacher.`,
        hasData: false
      }, { status: 404 });
    }

    // Mock data for report (will be replaced with CMS data later)
    const reportData = {
      student: {
        name: student.StudentProfile?.fullName || student.name,
        email: student.email,
        class: student.enrollments?.[0]?.program?.level?.name || "Not Assigned",
        program: student.enrollments?.[0]?.program?.name || "Not Enrolled",
        track: student.enrollments?.[0]?.program?.track?.name || "General"
      },
      school: {
        name: "Excellence Academy",
        motto: "Excellence in Education, Character in Life",
        address: "123 Education Street, Learning City",
        phone: "+1 (555) 123-4567",
        email: "info@excellenceacademy.edu"
      },
      term: {
        name: term.replace("_", " "),
        year: "2024/2025",
        startDate: "2024-09-01",
        endDate: "2024-12-15"
      },
      exams: student.attempts.map(attempt => ({
        subject: attempt.exam.title,
        examScore: attempt.score || 0,
        caScore: Math.floor(Math.random() * 30) + 10, // Mock CA score
        totalScore: (attempt.score || 0) + Math.floor(Math.random() * 30) + 10,
        grade: getGrade((attempt.score || 0) + Math.floor(Math.random() * 30) + 10),
        teacher: attempt.exam.createdBy?.TeacherProfile?.fullName || attempt.exam.createdBy?.name || "Unknown",
        remark: getTeacherRemark((attempt.score || 0) + Math.floor(Math.random() * 30) + 10)
      })),
      summary: {
        totalSubjects: student.attempts.length,
        totalScore: student.attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0),
        averageScore: student.attempts.length > 0 ? 
          Math.round(student.attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / student.attempts.length) : 0,
        position: Math.floor(Math.random() * 50) + 1, // Mock position
        totalStudents: Math.floor(Math.random() * 100) + 50 // Mock class size
      },
      adminSignature: "Dr. John Smith",
      adminTitle: "Principal",
      nextTermBegins: "2025-01-15"
    };

    return NextResponse.json({ reportData });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

function getGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function getTeacherRemark(score: number): string {
  if (score >= 90) return "Excellent performance! Keep up the outstanding work.";
  if (score >= 80) return "Very good work. Continue to strive for excellence.";
  if (score >= 70) return "Good effort. There's room for improvement.";
  if (score >= 60) return "Satisfactory. More effort needed in this subject.";
  if (score >= 50) return "Below average. Requires significant improvement.";
  return "Poor performance. Immediate attention and extra support needed.";
}