"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Loader2, CheckCircle, Users } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Program {
  id: string;
  name: string;
  subjects: Subject[];
}

interface Grade {
  id: string;
  continuousAssessment: number;
  examination: number;
  totalScore: number;
  grade: string;
  student: { name: string };
  subject: { name: string };
}

export default function GradeCalculationPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [programs, setPrograms] = useState<Program[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("FIRST");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      fetchStudents();
      fetchGrades();
    }
  }, [selectedProgram, selectedTerm]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/programs");
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
        if (data.length > 0) {
          setSelectedProgram(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/student/classes?programId=${selectedProgram}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await fetch(`/api/grades/calculate?programId=${selectedProgram}&term=${selectedTerm}`);
      if (response.ok) {
        const data = await response.json();
        setGrades(data.grades || []);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const calculateAllGrades = async () => {
    if (!selectedProgram) {
      toast.error("Please select a program");
      return;
    }

    setCalculating(true);
    try {
      const program = programs.find(p => p.id === selectedProgram);
      if (!program) return;

      const promises = [];
      for (const student of students) {
        for (const subject of program.subjects) {
          promises.push(
            fetch("/api/grades/calculate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                studentId: student.id,
                subjectId: subject.id,
                programId: selectedProgram,
                term: selectedTerm
              })
            })
          );
        }
      }

      await Promise.all(promises);
      await fetchGrades();
      toast.success("Grades calculated successfully");
    } catch (error) {
      console.error("Error calculating grades:", error);
      toast.error("Failed to calculate grades");
    } finally {
      setCalculating(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "text-green-600 bg-green-50";
      case "B": return "text-blue-600 bg-blue-50";
      case "C": return "text-yellow-600 bg-yellow-50";
      case "D": return "text-orange-600 bg-orange-50";
      case "F": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Calculator className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            Calculate Final Grades
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Combine CA and Exam scores to generate final grades
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Program</label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="FIRST">First Term</option>
                  <option value="SECOND">Second Term</option>
                  <option value="THIRD">Third Term</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={calculateAllGrades}
                  disabled={calculating || !selectedProgram}
                  className="w-full gap-2"
                >
                  {calculating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4" />
                      Calculate Grades
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-sm text-slate-600">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{grades.length}</p>
                  <p className="text-sm text-slate-600">Grades Calculated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calculator className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {grades.length > 0 ? (grades.reduce((sum, g) => sum + g.totalScore, 0) / grades.length).toFixed(1) : "0"}%
                  </p>
                  <p className="text-sm text-slate-600">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grades Table */}
        {grades.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4">Calculated Grades</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="border border-slate-300 px-4 py-2 text-left">Student</th>
                      <th className="border border-slate-300 px-4 py-2 text-left">Subject</th>
                      <th className="border border-slate-300 px-4 py-2 text-center">CA (40)</th>
                      <th className="border border-slate-300 px-4 py-2 text-center">Exam (60)</th>
                      <th className="border border-slate-300 px-4 py-2 text-center">Total (100)</th>
                      <th className="border border-slate-300 px-4 py-2 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => (
                      <tr key={grade.id}>
                        <td className="border border-slate-300 px-4 py-2 font-medium">
                          {grade.student.name}
                        </td>
                        <td className="border border-slate-300 px-4 py-2">
                          {grade.subject.name}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-center">
                          {grade.continuousAssessment.toFixed(1)}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-center">
                          {grade.examination.toFixed(1)}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-center font-bold">
                          {grade.totalScore.toFixed(1)}
                        </td>
                        <td className="border border-slate-300 px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-sm font-bold ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}