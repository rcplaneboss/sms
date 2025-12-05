"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Exam {
  id: string;
  title: string;
  questions: { id: string }[];
  createdBy: { name: string };
  attempts: { id: string; score: number | null }[];
}

export default function StudentExamsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingExam, setStartingExam] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchExams();
    }
  }, [session?.user?.id]);

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams");
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId: string) => {
    setStartingExam(examId);
    try {
      const response = await fetch(`/api/exams/${examId}/attempt`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Exam started");
        // Redirect to exam taker page
        redirect(`/my-exams/${examId}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to start exam");
      }
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Error starting exam");
    } finally {
      setStartingExam(null);
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
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            Available Exams
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Take exams to assess your knowledge
          </p>
        </div>

        {/* Exams List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.length === 0 ? (
            <Card className="md:col-span-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <CardContent className="pt-12 pb-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No exams available
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Check back later for available exams
                </p>
              </CardContent>
            </Card>
          ) : (
            exams.map((exam) => {
              const hasAttempted = exam.attempts.length > 0;
              const score = hasAttempted ? exam.attempts[0]?.score : null;

              return (
                <Card
                  key={exam.id}
                  className="border border-slate-200 dark:border-slate-700 hover:shadow-lg transition"
                >
                  <CardContent className="pt-6 pb-6">
                    <div className="space-y-4">
                      {/* Title and Status */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white pr-2">
                            {exam.title}
                          </h3>
                          {hasAttempted && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium whitespace-nowrap">
                              <CheckCircle className="h-3.5 w-3.5" />
                              Completed
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          By {exam.createdBy.name}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {exam.questions.length} Questions
                        </div>
                        {hasAttempted && score !== null && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            Score: {score}%
                          </div>
                        )}
                      </div>

                      {/* Note if already attempted */}
                      {hasAttempted && (
                        <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          You have already completed this exam.
                        </div>
                      )}

                      {/* Action Button */}
                      {hasAttempted ? (
                        <Button
                          disabled
                          className="w-full"
                          variant="outline"
                        >
                          Already Attempted
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleStartExam(exam.id)}
                          disabled={startingExam === exam.id}
                          className="w-full gap-2"
                        >
                          {startingExam === exam.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            <>
                              Start Exam
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
