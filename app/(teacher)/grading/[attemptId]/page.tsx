"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Loader2,
  Save,
  X,
  BookOpen,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface GradeData {
  id: string;
  user: { id: string; name: string; email: string };
  exam: { id: string; title: string };
  score: number | null;
}

export default function TeacherGradingPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [attemptId, setAttemptId] = useState<string>("");
  const [attempt, setAttempt] = useState<GradeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  // Extract attemptId from params
  useEffect(() => {
    params.then((p) => setAttemptId(p.attemptId));
  }, [params]);

  // Fetch attempt data
  useEffect(() => {
    if (!attemptId) return;

    const fetchAttempt = async () => {
      try {
        const response = await fetch(`/api/attempts/${attemptId}`);
        if (response.ok) {
          const data = await response.json();
          setAttempt(data);
          setScore(data.score?.toString() || "");
        } else {
          toast.error("Attempt not found");
          redirect("/teacher-dashboard");
        }
      } catch (error) {
        console.error("Error fetching attempt:", error);
        toast.error("Failed to load attempt");
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId]);

  const handleSaveGrade = async () => {
    if (!score || parseInt(score) < 0 || parseInt(score) > 100) {
      toast.error("Please enter a valid score between 0 and 100");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: parseInt(score),
          feedback: feedback
        }),
      });

      if (response.ok) {
        toast.success("Grade saved successfully");
        redirect("/teacher-dashboard");
      } else {
        toast.error("Failed to save grade");
      }
    } catch (error) {
      console.error("Error saving grade:", error);
      toast.error("Error saving grade");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-slate-600 dark:text-slate-400">
              Attempt not found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAlreadyGraded = attempt.score !== null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            Grade Exam
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Review and grade student exam submission
          </p>
        </div>

        {/* Student Info Card */}
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Student Name
                </p>
                <p className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  {attempt.user.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Email
                </p>
                <p className="text-slate-900 dark:text-white">
                  {attempt.user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Info Card */}
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Exam Title
                </p>
                <p className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  {attempt.exam.title}
                </p>
              </div>
              {isAlreadyGraded && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-800 dark:text-green-300">
                  <CheckCircle className="h-5 w-5" />
                  Already Graded
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grading Form */}
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Score (0-100)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Enter score"
                  className="text-lg py-3 pr-12"
                  disabled={isAlreadyGraded && session?.user?.role !== "ADMIN"}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400">
                  %
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Enter a score between 0 and 100
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback for the student..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={6}
                disabled={isAlreadyGraded && session?.user?.role !== "ADMIN"}
              />
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Help the student understand their performance
              </p>
            </div>

            {isAlreadyGraded && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    Already Graded
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    This attempt has already been graded. Contact an administrator to change it.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 sm:justify-end">
          <Button
            onClick={() => redirect("/teacher-dashboard")}
            variant="outline"
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSaveGrade}
            disabled={saving || (isAlreadyGraded && session?.user?.role !== "ADMIN")}
            className="gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Grade
              </>
            )}
          </Button>
          <Button
            onClick={() => redirect(`/grading/questions/${attemptId}`)}
            variant="outline"
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Grade Questions
          </Button>
        </div>
      </div>
    </div>
  );
}
