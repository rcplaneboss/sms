"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, FileText, BarChart3, Loader2, ArrowRight } from "lucide-react";

interface TeacherStats {
  assignedSubjects: number;
  totalStudents: number;
  pendingGrades: number;
  subjects: any[];
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardStats();
    }
  }, [session?.user?.id]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/teacher/dashboard");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Welcome back, {session?.user?.name || "Teacher"}!
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Here's an overview of your courses and teaching responsibilities.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardStatCard
            title="Assigned Subjects"
            value={stats.assignedSubjects}
            icon={<BookOpen className="h-5 w-5" />}
            subtext="Subjects you're teaching"
          />
          <DashboardStatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<Users className="h-5 w-5" />}
            subtext="Across all courses"
          />
          <DashboardStatCard
            title="Pending Grades"
            value={stats.pendingGrades}
            icon={<FileText className="h-5 w-5" />}
            subtext="To be submitted"
          />
        </div>

        {/* Courses Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              My Subjects & Programs
            </h2>
          </div>

          {stats.subjects?.length === 0 ? (
            <Card className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  No subjects assigned yet
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your subjects will appear here once they're assigned by the admin.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {stats.subjects?.map((subject: any) => (
                <Card
                  key={subject.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">
                      {subject.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subject.programs?.map((program: any) => (
                        <div
                          key={program.id}
                          className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {program.name}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {program.level} - {program.track}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
                            <Users className="h-4 w-4" />
                            <span>{program.studentCount} students</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              href="/classes"
              variant="outline"
              className="h-auto flex-col py-6 justify-center items-center gap-2 rounded-lg border-2"
            >
              <BookOpen className="h-6 w-6" />
              <span>My Classes</span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Manage classes
              </span>
            </Button>
            <Button
              href="/grading"
              variant="outline"
              className="h-auto flex-col py-6 justify-center items-center gap-2 rounded-lg border-2"
            >
              <FileText className="h-6 w-6" />
              <span>Grade Students</span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Submit grades
              </span>
            </Button>
            <Button
              href="/exams"
              variant="outline"
              className="h-auto flex-col py-6 justify-center items-center gap-2 rounded-lg border-2"
            >
              <BarChart3 className="h-6 w-6" />
              <span>Create Exams</span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                New exam
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}