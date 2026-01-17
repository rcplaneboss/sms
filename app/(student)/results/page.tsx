"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/LinkAsButton";
import { FileText, Download, Eye, Calendar } from "lucide-react";

interface Grade {
  id: string;
  subject: { name: string };
  continuousAssessment: number | null;
  examination: number | null;
  totalScore: number | null;
  grade: string | null;
  teacherComment: string | null;
}

interface QuestionResult {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  marksAwarded: number;
  maxMarks: number;
  teacherComment: string | null;
}

interface DetailedGrade extends Grade {
  questionResults?: QuestionResult[];
}

interface Report {
  id: string;
  term: string;
  totalSubjects: number;
  totalScore: number;
  averageScore: number;
  position: number | null;
  grade: string | null;
  attendanceRate: number | null;
  conductGrade: string | null;
  teacherRemarks: string | null;
  principalRemarks: string | null;
}

const StudentResults = () => {
  const { data: session } = useSession();
  const [selectedTerm, setSelectedTerm] = useState("FIRST");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [programs, setPrograms] = useState([]);
  const [report, setReport] = useState<Report | null>(null);
  const [grades, setGrades] = useState<DetailedGrade[]>([]);
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  const [allTermsData, setAllTermsData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram && selectedTerm) {
      fetchReport();
    }
  }, [selectedProgram, selectedTerm]);

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/student/programs");
      const data = await res.json();
      setPrograms(data.programs || []);
      if (data.programs?.length > 0) {
        setSelectedProgram(data.programs[0].id);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchReport = async () => {
    if (!session?.user?.id || !selectedProgram) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports?studentId=${session.user.id}&programId=${selectedProgram}&term=${selectedTerm}&detailed=true`
      );
      const data = await res.json();
      setReport(data.report);
      setGrades(data.grades || []);
      setAllTermsData(data.allTermsData);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  const getGradeColor = (grade: string | null) => {
    switch (grade) {
      case "A": return "text-green-600 bg-green-50";
      case "B": return "text-blue-600 bg-blue-50";
      case "C": return "text-yellow-600 bg-yellow-50";
      case "D": return "text-orange-600 bg-orange-50";
      case "F": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6 print:shadow-none">
          <div className="flex items-center justify-between mb-4 print:mb-8">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Academic Results
              </h1>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button onClick={printReport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Print Report
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Program
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                {programs.map((program: any) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Term
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
              >
                <option value="FIRST">First Term</option>
                <option value="SECOND">Second Term</option>
                <option value="THIRD">Third Term (Annual Report)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {report && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg print:shadow-none print:p-12">
            {/* School Header */}
            <div className="text-center mb-8 print:mb-12">
              <div className="flex items-center justify-center mb-4">
                {/* School Logo Placeholder */}
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  SMS
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    School Management System
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">Academic Excellence Center</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {selectedTerm === "THIRD" ? "Annual Academic Report" : `${selectedTerm.charAt(0) + selectedTerm.slice(1).toLowerCase()} Term Report`}
              </h3>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Student Information</h4>
                <p><span className="font-medium">Name:</span> {session?.user?.name}</p>
                <p><span className="font-medium">Email:</span> {session?.user?.email}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Academic Summary</h4>
                <p><span className="font-medium">Total Subjects:</span> {report.totalSubjects}</p>
                <p><span className="font-medium">Average Score:</span> {report.averageScore.toFixed(1)}%</p>
                <p><span className="font-medium">Overall Grade:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm font-bold ${getGradeColor(report.grade)}`}>
                    {report.grade}
                  </span>
                </p>
              </div>
            </div>

            {/* Grades Table */}
            <div className="mb-8">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Subject Performance</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">CA (40)</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Exam (60)</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Total (100)</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Grade</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => (
                      <tr key={grade.id}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          <div className="flex items-center justify-between">
                            <span>{grade.subject.name}</span>
                            {grade.questionResults && grade.questionResults.length > 0 && (
                              <Button
                                onClick={() => setExpandedGrade(expandedGrade === grade.id ? null : grade.id)}
                                variant="outline"
                                size="sm"
                                className="ml-2"
                              >
                                <Eye className="w-4 h-4" />
                                {expandedGrade === grade.id ? 'Hide' : 'Details'}
                              </Button>
                            )}
                          </div>
                          {expandedGrade === grade.id && grade.questionResults && (
                            <div className="mt-4 space-y-2">
                              <h5 className="font-semibold text-sm">Question Breakdown:</h5>
                              {grade.questionResults.map((qr, idx) => (
                                <div key={qr.questionId} className="bg-gray-50 p-3 rounded text-sm">
                                  <p><strong>Q{idx + 1}:</strong> {qr.questionText}</p>
                                  <p><strong>Your Answer:</strong> {qr.studentAnswer}</p>
                                  <p><strong>Score:</strong> {qr.marksAwarded}/{qr.maxMarks}</p>
                                  {qr.teacherComment && (
                                    <p><strong>Feedback:</strong> {qr.teacherComment}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {grade.continuousAssessment || "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {grade.examination || "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                          {grade.totalScore?.toFixed(1) || "-"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-sm font-bold ${getGradeColor(grade.grade)}`}>
                            {grade.grade || "-"}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {grade.teacherComment || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Third Term Annual Summary */}
            {selectedTerm === "THIRD" && allTermsData && (
              <div className="mb-8">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Annual Performance Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
                    <h5 className="font-medium text-blue-700 dark:text-blue-300">First Term</h5>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {allTermsData.terms.FIRST.length > 0 
                        ? (allTermsData.terms.FIRST.reduce((sum: number, g: any) => sum + (g.totalScore || 0), 0) / allTermsData.terms.FIRST.length).toFixed(1)
                        : "N/A"
                      }%
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
                    <h5 className="font-medium text-green-700 dark:text-green-300">Second Term</h5>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {allTermsData.terms.SECOND.length > 0 
                        ? (allTermsData.terms.SECOND.reduce((sum: number, g: any) => sum + (g.totalScore || 0), 0) / allTermsData.terms.SECOND.length).toFixed(1)
                        : "N/A"
                      }%
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
                    <h5 className="font-medium text-purple-700 dark:text-purple-300">Third Term</h5>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {report.averageScore.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-lg font-semibold">
                    Annual Average: <span className="text-blue-600 dark:text-blue-400">{allTermsData.yearlyAverage.toFixed(1)}%</span>
                  </p>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Class Teacher's Remarks</h4>
                <div className="border border-gray-300 p-4 rounded min-h-[100px] bg-gray-50 dark:bg-gray-700">
                  {report.teacherRemarks || "No remarks provided"}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Principal's Remarks</h4>
                <div className="border border-gray-300 p-4 rounded min-h-[100px] bg-gray-50 dark:bg-gray-700">
                  {report.principalRemarks || "No remarks provided"}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 border-t pt-4">
              <p>Generated on {new Date().toLocaleDateString()}</p>
              <p className="mt-2">School Management System - Academic Excellence Center</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResults;