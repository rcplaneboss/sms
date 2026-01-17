"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/LinkAsButton";
import { GraduationCap, Filter, Download, Users, BookOpen, Calculator } from "lucide-react";

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
  level: { name: string };
  track: { name: string };
}

interface Grade {
  id: string;
  studentId: string;
  continuousAssessment?: number;
  examination?: number;
  totalScore?: number;
  grade?: string;
  teacherComment?: string;
  term: string;
  student: Student;
  subject: Subject;
  program: Program;
  teacher?: { id: string; name: string };
}

const AdminGradingSystem = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [gradeFilter, setGradeFilter] = useState<string>("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [selectedProgram, selectedSubject, selectedTerm]);

  const fetchInitialData = async () => {
    try {
      const [programsRes, subjectsRes] = await Promise.all([
        fetch("/api/admin-assign"),
        fetch("/api/admin-assign")
      ]);

      if (programsRes.ok && subjectsRes.ok) {
        const programsData = await programsRes.json();
        const subjectsData = await subjectsRes.json();
        
        setPrograms(programsData.programs || []);
        setSubjects(subjectsData.subjects || []);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load programs and subjects");
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedProgram) params.append("programId", selectedProgram);
      if (selectedSubject) params.append("subjectId", selectedSubject);
      if (selectedTerm) params.append("term", selectedTerm);

      const res = await fetch(`/api/grades?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch grades");
      
      const data = await res.json();
      setGrades(data.grades || []);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to load grades");
    }
  };

  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case "A": return "text-green-600 bg-green-50 border-green-200";
      case "B": return "text-blue-600 bg-blue-50 border-blue-200";
      case "C": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "D": return "text-orange-600 bg-orange-50 border-orange-200";
      case "F": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getGradeStats = () => {
    const stats = {
      total: grades.length,
      A: grades.filter(g => g.grade === "A").length,
      B: grades.filter(g => g.grade === "B").length,
      C: grades.filter(g => g.grade === "C").length,
      D: grades.filter(g => g.grade === "D").length,
      F: grades.filter(g => g.grade === "F").length,
      pending: grades.filter(g => !g.grade).length
    };
    return stats;
  };

  const filteredGrades = grades.filter(grade => {
    if (gradeFilter && grade.grade !== gradeFilter) return false;
    return true;
  });

  const stats = getGradeStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading grading system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <header className="py-6 mb-8 text-center border-b dark:border-gray-800">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center justify-center">
            <GraduationCap className="w-10 h-10 mr-4 text-blue-500" />
            Admin Grading Overview
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Monitor and manage all student grades across programs
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl shadow-lg text-center border border-green-200">
            <p className="text-sm text-green-600 dark:text-green-400">Grade A</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.A}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl shadow-lg text-center border border-blue-200">
            <p className="text-sm text-blue-600 dark:text-blue-400">Grade B</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.B}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl shadow-lg text-center border border-yellow-200">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">Grade C</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.C}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl shadow-lg text-center border border-orange-200">
            <p className="text-sm text-orange-600 dark:text-orange-400">Grade D</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.D}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl shadow-lg text-center border border-red-200">
            <p className="text-sm text-red-600 dark:text-red-400">Grade F</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.F}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center border border-gray-200">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.pending}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 mr-2 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Program
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Programs</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name} ({program.level.name} - {program.track.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Term
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Terms</option>
                <option value="FIRST">First Term</option>
                <option value="SECOND">Second Term</option>
                <option value="THIRD">Third Term</option>
                <option value="FOURTH">Fourth Term</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Grade
              </label>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Grades</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
                <option value="D">Grade D</option>
                <option value="F">Grade F</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSelectedProgram("");
                  setSelectedSubject("");
                  setSelectedTerm("");
                  setGradeFilter("");
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Student Grades ({filteredGrades.length})
              </h2>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Program
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Term
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                    CA (40)
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Exam (60)
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Total
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Grade
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Teacher
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredGrades.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No grades found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredGrades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{grade.student.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{grade.student.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{grade.subject.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{grade.program.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {grade.program.level.name} - {grade.program.track.name}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {grade.term.charAt(0) + grade.term.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {grade.continuousAssessment || "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {grade.examination || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-bold">
                          {grade.totalScore?.toFixed(1) || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(grade.grade)}`}>
                          {grade.grade || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {grade.teacher?.name || "Not assigned"}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGradingSystem;