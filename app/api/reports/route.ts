import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const programId = searchParams.get("programId");
    const term = searchParams.get("term");
    const detailed = searchParams.get("detailed") === "true";

    if (!studentId || !programId || !term) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Get all grades for the student in the program for the term
    const grades = await prisma.grade.findMany({
      where: {
        studentId,
        programId,
        term: term as any
      },
      include: {
        subject: true,
        student: {
          select: {
            name: true,
            email: true,
            StudentProfile: {
              select: {
                fullName: true
              }
            }
          }
        },
        program: {
          include: {
            level: true,
            track: true
          }
        }
      }
    });

    // If detailed results requested, get question-level data
    let detailedGrades = grades;
    if (detailed) {
      detailedGrades = await Promise.all(
        grades.map(async (grade) => {
          const attempts = await prisma.attempt.findMany({
            where: {
              userId: studentId,
              exam: {
                subjectId: grade.subjectId,
                programId,
                term: term as any
              }
            },
            include: {
              questionGrades: {
                include: {
                  question: {
                    select: {
                      text: true
                    }
                  }
                }
              },
              exam: {
                select: {
                  questions: {
                    select: {
                      id: true,
                      text: true
                    }
                  }
                }
              }
            }
          });

          const questionResults = attempts.flatMap(attempt => 
            attempt.questionGrades.map(qg => ({
              questionId: qg.questionId,
              questionText: qg.question.text,
              studentAnswer: qg.studentAnswer || "No answer",
              marksAwarded: qg.marksAwarded,
              maxMarks: qg.maxMarks,
              teacherComment: qg.teacherComment
            }))
          );

          return {
            ...grade,
            questionResults
          };
        })
      );
    }

    // Calculate totals and averages
    const totalSubjects = detailedGrades.length;
    const totalScore = detailedGrades.reduce((sum, grade) => sum + (grade.totalScore || 0), 0);
    const averageScore = totalSubjects > 0 ? totalScore / totalSubjects : 0;

    // Get or create report
    let report = await prisma.report.findUnique({
      where: {
        studentId_programId_term: {
          studentId,
          programId,
          term: term as any
        }
      }
    });

    if (!report) {
      report = await prisma.report.create({
        data: {
          studentId,
          programId,
          term: term as any,
          totalSubjects,
          totalScore,
          averageScore,
          grade: averageScore >= 80 ? "A" : averageScore >= 70 ? "B" : averageScore >= 60 ? "C" : averageScore >= 50 ? "D" : "F"
        }
      });
    }

    // For third term, get all terms data
    let allTermsData = null;
    if (term === "THIRD") {
      const allTermsGrades = await prisma.grade.findMany({
        where: {
          studentId,
          programId,
          term: { in: ["FIRST", "SECOND", "THIRD"] }
        },
        include: {
          subject: true
        }
      });

      // Group by term
      const termGroups = {
        FIRST: allTermsGrades.filter(g => g.term === "FIRST"),
        SECOND: allTermsGrades.filter(g => g.term === "SECOND"),
        THIRD: allTermsGrades.filter(g => g.term === "THIRD")
      };

      allTermsData = {
        terms: termGroups,
        yearlyAverage: Object.values(termGroups).flat().reduce((sum, grade) => sum + (grade.totalScore || 0), 0) / Object.values(termGroups).flat().length
      };
    }

    return NextResponse.json({
      report,
      grades: detailedGrades,
      student: detailedGrades[0]?.student,
      program: detailedGrades[0]?.program,
      allTermsData
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}