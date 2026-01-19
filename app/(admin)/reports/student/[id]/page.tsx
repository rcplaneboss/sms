"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReportData {
  student: {
    name: string;
    email: string;
    class: string;
    program: string;
    track: string;
  };
  school: {
    name: string;
    motto: string;
    address: string;
    phone: string;
    email: string;
  };
  term: {
    name: string;
    year: string;
    startDate: string;
    endDate: string;
  };
  exams: Array<{
    subject: string;
    examScore: number;
    caScore: number;
    totalScore: number;
    grade: string;
    teacher: string;
    remark: string;
  }>;
  summary: {
    totalSubjects: number;
    totalScore: number;
    averageScore: number;
    position: number;
    totalStudents: number;
  };
  adminSignature: string;
  adminTitle: string;
  nextTermBegins: string;
}

export default function StudentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState("FIRST_TERM");
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setStudentId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (studentId) {
      fetchReportData();
    }
  }, [studentId, selectedTerm]);

  const fetchReportData = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/student/${studentId}?term=${selectedTerm}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data.reportData);
      } else {
        toast.error("Failed to load report data");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Error loading report");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!reportData) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Report - ${reportData.student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { width: 80px; height: 80px; margin: 0 auto 10px; }
            .school-name { font-size: 24px; font-weight: bold; margin: 10px 0; }
            .motto { font-style: italic; color: #666; }
            .report-title { font-size: 20px; font-weight: bold; margin: 20px 0; }
            .student-info { display: flex; justify-content: space-between; margin: 20px 0; }
            .info-section { flex: 1; }
            .grades-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .grades-table th, .grades-table td { border: 1px solid #333; padding: 8px; text-align: center; }
            .grades-table th { background-color: #f5f5f5; font-weight: bold; }
            .summary { margin: 30px 0; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; }
            .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature { text-align: center; }
            .signature-line { border-top: 1px solid #333; width: 200px; margin: 40px auto 10px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo.png" alt="School Logo" class="logo" />
            <div class="school-name">${reportData.school.name}</div>
            <div class="motto">${reportData.school.motto}</div>
            <div>${reportData.school.address}</div>
            <div>${reportData.school.phone} | ${reportData.school.email}</div>
            <div class="report-title">STUDENT ACADEMIC REPORT</div>
          </div>

          <div class="student-info">
            <div class="info-section">
              <strong>Student Name:</strong> ${reportData.student.name}<br>
              <strong>Class:</strong> ${reportData.student.class}<br>
              <strong>Program:</strong> ${reportData.student.program}
            </div>
            <div class="info-section">
              <strong>Term:</strong> ${reportData.term.name}<br>
              <strong>Academic Year:</strong> ${reportData.term.year}<br>
              <strong>Track:</strong> ${reportData.student.track}
            </div>
          </div>

          <table class="grades-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>CA Score (40%)</th>
                <th>Exam Score (60%)</th>
                <th>Total Score</th>
                <th>Grade</th>
                <th>Teacher</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.exams.map(exam => `
                <tr>
                  <td>${exam.subject}</td>
                  <td>${exam.caScore}</td>
                  <td>${exam.examScore}</td>
                  <td>${exam.totalScore}</td>
                  <td>${exam.grade}</td>
                  <td>${exam.teacher}</td>
                  <td>${exam.remark}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary">
            <h3>TERM SUMMARY</h3>
            <div style="display: flex; justify-content: space-between;">
              <div>
                <strong>Total Subjects:</strong> ${reportData.summary.totalSubjects}<br>
                <strong>Average Score:</strong> ${reportData.summary.averageScore}%<br>
              </div>
              <div>
                <strong>Position in Class:</strong> ${reportData.summary.position} of ${reportData.summary.totalStudents}<br>
                <strong>Next Term Begins:</strong> ${new Date(reportData.nextTermBegins).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div class="signature-section">
            <div class="signature">
              <div class="signature-line"></div>
              <div>Class Teacher</div>
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <div>${reportData.adminSignature}</div>
              <div>${reportData.adminTitle}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Report not found</h2>
          <Button onClick={() => router.push("/user-management")} className="mt-4">
            Back to User Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/user-management")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Student Report</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Academic report for {reportData.student.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIRST_TERM">First Term</SelectItem>
                <SelectItem value="SECOND_TERM">Second Term</SelectItem>
                <SelectItem value="THIRD_TERM">Third Term</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generatePDF} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center border-b-2 border-slate-300 pb-6 mb-8">
              <img src="/logo.png" alt="School Logo" className="w-20 h-20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900">{reportData.school.name}</h2>
              <p className="text-slate-600 italic">{reportData.school.motto}</p>
              <p className="text-sm text-slate-500">{reportData.school.address}</p>
              <p className="text-sm text-slate-500">{reportData.school.phone} | {reportData.school.email}</p>
              <h3 className="text-xl font-bold mt-4 text-slate-900">STUDENT ACADEMIC REPORT</h3>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p><strong>Student Name:</strong> {reportData.student.name}</p>
                <p><strong>Class:</strong> {reportData.student.class}</p>
                <p><strong>Program:</strong> {reportData.student.program}</p>
              </div>
              <div>
                <p><strong>Term:</strong> {reportData.term.name}</p>
                <p><strong>Academic Year:</strong> {reportData.term.year}</p>
                <p><strong>Track:</strong> {reportData.student.track}</p>
              </div>
            </div>

            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-3 text-left">Subject</th>
                    <th className="border border-slate-300 p-3 text-center">CA (40%)</th>
                    <th className="border border-slate-300 p-3 text-center">Exam (60%)</th>
                    <th className="border border-slate-300 p-3 text-center">Total</th>
                    <th className="border border-slate-300 p-3 text-center">Grade</th>
                    <th className="border border-slate-300 p-3 text-left">Teacher</th>
                    <th className="border border-slate-300 p-3 text-left">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.exams.map((exam, index) => (
                    <tr key={index}>
                      <td className="border border-slate-300 p-3">{exam.subject}</td>
                      <td className="border border-slate-300 p-3 text-center">{exam.caScore}</td>
                      <td className="border border-slate-300 p-3 text-center">{exam.examScore}</td>
                      <td className="border border-slate-300 p-3 text-center font-bold">{exam.totalScore}</td>
                      <td className="border border-slate-300 p-3 text-center font-bold">{exam.grade}</td>
                      <td className="border border-slate-300 p-3">{exam.teacher}</td>
                      <td className="border border-slate-300 p-3 text-sm">{exam.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg mb-8">
              <h4 className="text-lg font-bold mb-4">TERM SUMMARY</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>Total Subjects:</strong> {reportData.summary.totalSubjects}</p>
                  <p><strong>Average Score:</strong> {reportData.summary.averageScore}%</p>
                </div>
                <div>
                  <p><strong>Position in Class:</strong> {reportData.summary.position} of {reportData.summary.totalStudents}</p>
                  <p><strong>Next Term Begins:</strong> {new Date(reportData.nextTermBegins).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-16">
              <div className="text-center">
                <div className="border-t border-slate-400 w-48 mb-2"></div>
                <p>Class Teacher</p>
              </div>
              <div className="text-center">
                <div className="border-t border-slate-400 w-48 mb-2"></div>
                <p>{reportData.adminSignature}</p>
                <p className="text-sm">{reportData.adminTitle}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}