"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Users,
  Award,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ExamResult {
  id: string;
  exam: { id: string; title: string };
  user: { id: string; name: string };
  score: number | null;
  createdAt: string;
}

export default function AdminResultsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchResults();
    }
  }, [session?.user?.role]);

  const fetchResults = async () => {
    try {
      const response = await fetch("/api/results");
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const gradedResults = results.filter((r) => r.score !== null);
  const pendingResults = results.filter((r) => r.score === null);
  const averageScore =
    gradedResults.length > 0
      ? Math.round(
          gradedResults.reduce((sum, r) => sum + (r.score || 0), 0) /
            gradedResults.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            Exam Results Overview
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            System-wide exam results and analytics
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardStatCard
            title="Total Attempts"
            value={results.length}
            icon={<Users className="h-5 w-5" />}
            subtext="All exam attempts"
          />
          <DashboardStatCard
            title="Graded"
            value={gradedResults.length}
            icon={<Award className="h-5 w-5" />}
            subtext={`${pendingResults.length} pending`}
          />
          <DashboardStatCard
            title="Average Score"
            value={`${averageScore}%`}
            icon={<TrendingUp className="h-5 w-5" />}
            subtext="Across graded exams"
          />
          <DashboardStatCard
            title="Pending Review"
            value={pendingResults.length}
            icon={<BookOpen className="h-5 w-5" />}
            subtext="Awaiting grading"
          />
        </div>

        {/* Results Table */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            All Exam Results
          </h2>

          {results.length === 0 ? (
            <Card className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <CardContent className="pt-12 pb-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No results yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Exam results will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Exam
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 20).map((result) => (
                    <tr
                      key={result.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                        {result.user.name}
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-white">
                        {result.exam.title}
                      </td>
                      <td className="px-4 py-3">
                        {result.score !== null ? (
                          <span className="text-lg font-bold text-slate-900 dark:text-white">
                            {result.score}%
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {result.score !== null ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Graded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(result.createdAt).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
