"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Loader2, Calendar, GraduationCap } from "lucide-react";
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

export default function StudentReportsPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState("FIRST_TERM");

  const fetchReportData = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setReportData(null); // Clear previous data
    try {
      const response = await fetch(`/api/reports/student/${session.user.id}?term=${selectedTerm}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data.reportData);
      } else {
        const errorData = await response.json();
        if (errorData.hasData === false) {
          toast.error(errorData.message || "No data available for this term");
        } else {
          toast.error("Failed to load report data");
        }
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
          <title>My Academic Report - ${reportData.student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); }
            .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .logo { width: 80px; height: 80px; margin: 0 auto 10px; }
            .school-name { font-size: 24px; font-weight: bold; margin: 10px 0; color: #1e40af; }
            .motto { font-style: italic; color: #6366f1; }
            .report-title { font-size: 20px; font-weight: bold; margin: 20px 0; color: #059669; }
            .student-info { display: flex; justify-content: space-between; margin: 20px 0; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .info-section { flex: 1; }
            .info-label { color: #3b82f6; font-weight: bold; }
            .grades-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .grades-table th { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; padding: 12px; text-align: center; font-weight: bold; }
            .grades-table td { border: 1px solid #e2e8f0; padding: 10px; text-align: center; }
            .grades-table tr:nth-child(even) { background-color: #f8fafc; }
            .grades-table tr:hover { background-color: #eff6ff; }
            .total-score { color: #059669; font-weight: bold; }
            .grade-cell { color: #7c3aed; font-weight: bold; }
            .summary { margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #3b82f6; border-radius: 8px; }
            .summary h3 { color: #1e40af; margin-bottom: 15px; }
            .summary-label { color: #059669; font-weight: bold; }
            .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature { text-align: center; }
            .signature-line { border-top: 2px solid #3b82f6; width: 200px; margin: 40px auto 10px; }
            @media print { body { margin: 0; background: white; } }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo.png" alt="School Logo" class="logo" />
            <div class="school-name">${reportData.school.name}</div>
            <div class="motto">${reportData.school.motto}</div>
            <div style="color: #64748b;">${reportData.school.address}</div>
            <div style="color: #64748b;">${reportData.school.phone} | ${reportData.school.email}</div>
            <div class="report-title">STUDENT ACADEMIC REPORT</div>
          </div>

          <div class="student-info">
            <div class="info-section">
              <span class="info-label">Student Name:</span> ${reportData.student.name}<br>
              <span class="info-label">Class:</span> ${reportData.student.class}<br>
              <span class="info-label">Program:</span> ${reportData.student.program}
            </div>
            <div class="info-section">
              <span class="info-label">Term:</span> ${reportData.term.name}<br>
              <span class="info-label">Academic Year:</span> ${reportData.term.year}<br>
              <span class="info-label">Track:</span> ${reportData.student.track}
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
                  <td style="text-align: left; font-weight: 500;">${exam.subject}</td>
                  <td>${exam.caScore}</td>
                  <td>${exam.examScore}</td>
                  <td class="total-score">${exam.totalScore}</td>
                  <td class="grade-cell">${exam.grade}</td>
                  <td style="text-align: left;">${exam.teacher}</td>
                  <td style="text-align: left; font-size: 12px;">${exam.remark}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary">
            <h3>TERM SUMMARY</h3>
            <div style="display: flex; justify-content: space-between;">
              <div>
                <span class="summary-label">Total Subjects:</span> ${reportData.summary.totalSubjects}<br>
                <span class="summary-label">Average Score:</span> ${reportData.summary.averageScore}%<br>
              </div>
              <div>
                <span class="summary-label">Position in Class:</span> ${reportData.summary.position} of ${reportData.summary.totalStudents}<br>
                <span class="summary-label">Next Term Begins:</span> ${new Date(reportData.nextTermBegins).toLocaleDateString()}
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              My Academic Reports
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              View and download your academic performance reports
            </p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Generate Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Term</label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIRST_TERM">First Term</SelectItem>
                    <SelectItem value="SECOND_TERM">Second Term</SelectItem>
                    <SelectItem value="THIRD_TERM">Third Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-6">
                <Button onClick={fetchReportData} disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                  Load Report
                </Button>
                {reportData && (
                  <Button onClick={generatePDF} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                )}
              </div>
            </div>

            {reportData && (
              <div className="border-t pt-6">
                <div className="text-center border-b-2 border-slate-300 dark:border-slate-600 pb-6 mb-8">
                  <img src="/logo.png" alt="School Logo" className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{reportData.school.name}</h2>
                  <p className="text-slate-600 dark:text-slate-400 italic">{reportData.school.motto}</p>
                  <h3 className="text-lg font-bold mt-4 text-blue-600 dark:text-blue-400">ACADEMIC REPORT - {reportData.term.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="space-y-2">
                    <p className="text-slate-700 dark:text-slate-300"><strong className="text-blue-600 dark:text-blue-400">Student:</strong> {reportData.student.name}</p>
                    <p className="text-slate-700 dark:text-slate-300"><strong className="text-blue-600 dark:text-blue-400">Class:</strong> {reportData.student.class}</p>
                    <p className="text-slate-700 dark:text-slate-300"><strong className="text-blue-600 dark:text-blue-400">Program:</strong> {reportData.student.program}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-700 dark:text-slate-300"><strong className="text-green-600 dark:text-green-400">Academic Year:</strong> {reportData.term.year}</p>
                    <p className="text-slate-700 dark:text-slate-300"><strong className="text-green-600 dark:text-green-400">Track:</strong> {reportData.student.track}</p>
                    <p className="text-slate-700 dark:text-slate-300"><strong className="text-green-600 dark:text-green-400">Position:</strong> {reportData.summary.position} of {reportData.summary.totalStudents}</p>
                  </div>
                </div>

                <div className="overflow-x-auto mb-8">
                  <table className="w-full border-collapse border border-slate-300 dark:border-slate-600">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <th className="border border-slate-300 dark:border-slate-600 p-3 text-left text-blue-800 dark:text-blue-200 font-semibold">Subject</th>
                        <th className="border border-slate-300 dark:border-slate-600 p-3 text-center text-blue-800 dark:text-blue-200 font-semibold">CA</th>
                        <th className="border border-slate-300 dark:border-slate-600 p-3 text-center text-blue-800 dark:text-blue-200 font-semibold">Exam</th>
                        <th className="border border-slate-300 dark:border-slate-600 p-3 text-center text-blue-800 dark:text-blue-200 font-semibold">Total</th>
                        <th className="border border-slate-300 dark:border-slate-600 p-3 text-center text-blue-800 dark:text-blue-200 font-semibold">Grade</th>
                        <th className="border border-slate-300 dark:border-slate-600 p-3 text-left text-blue-800 dark:text-blue-200 font-semibold">Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.exams.map((exam, index) => (
                        <tr key={index} className={`${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}>
                          <td className="border border-slate-300 dark:border-slate-600 p-3 text-slate-900 dark:text-slate-100">{exam.subject}</td>
                          <td className="border border-slate-300 dark:border-slate-600 p-3 text-center text-slate-900 dark:text-slate-100">{exam.caScore}</td>
                          <td className="border border-slate-300 dark:border-slate-600 p-3 text-center text-slate-900 dark:text-slate-100">{exam.examScore}</td>
                          <td className="border border-slate-300 dark:border-slate-600 p-3 text-center font-bold text-green-600 dark:text-green-400">{exam.totalScore}</td>
                          <td className="border border-slate-300 dark:border-slate-600 p-3 text-center font-bold text-purple-600 dark:text-purple-400">{exam.grade}</td>
                          <td className="border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-700 dark:text-slate-300">{exam.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h4 className="text-lg font-bold mb-4 text-blue-800 dark:text-blue-200">SUMMARY</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-slate-700 dark:text-slate-300"><strong className="text-green-600 dark:text-green-400">Total Subjects:</strong> {reportData.summary.totalSubjects}</p>
                      <p className="text-slate-700 dark:text-slate-300"><strong className="text-green-600 dark:text-green-400">Average Score:</strong> {reportData.summary.averageScore}%</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-700 dark:text-slate-300"><strong className="text-purple-600 dark:text-purple-400">Class Position:</strong> {reportData.summary.position} of {reportData.summary.totalStudents}</p>
                      <p className="text-slate-700 dark:text-slate-300"><strong className="text-purple-600 dark:text-purple-400">Next Term:</strong> {new Date(reportData.nextTermBegins).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!reportData && !loading && (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-lg border border-blue-200 dark:border-blue-700">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-blue-400 dark:text-blue-500" />
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No Report Data</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Select a term and click "Load Report" to view your academic report
                  </p>
                  <div className="text-sm text-slate-500 dark:text-slate-500">
                    <p>• First Term: September - December</p>
                    <p>• Second Term: January - April</p>
                    <p>• Third Term: May - August</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}