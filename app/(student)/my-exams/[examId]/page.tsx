"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  type: string;
}

interface ExamData {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
  createdBy: { name: string };
  attempts: { id: string; score: number | null }[];
}

export default function ExamTakerPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [examId, setExamId] = useState<string>("");
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);

  useEffect(() => {
    params.then((p) => setExamId(p.examId));
  }, [params]);

  useEffect(() => {
    if (!examId) return;

    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/exams/${examId}`);
        if (response.ok) {
          const data = await response.json();
          setExamData(data);
          setTimeLeft((data.duration || 60) * 60);
        } else {
          toast.error("Exam not found");
          redirect("/my-exams");
        }
      } catch (error) {
        console.error("Error fetching exam:", error);
        toast.error("Failed to load exam");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        toast.warning("Tab switch detected! This will be reported.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [submitted]);

  useEffect(() => {
    if (submitted) return;

    const preventCopy = (e: Event) => e.preventDefault();
    const preventContextMenu = (e: Event) => e.preventDefault();

    document.addEventListener("copy", preventCopy);
    document.addEventListener("cut", preventCopy);
    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("cut", preventCopy);
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, [submitted]);

  useEffect(() => {
    if (submitted || !examData) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, examData]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitExam = async () => {
    if (submitted) return;

    setSubmitting(true);
    try {
      const score = Math.round((Object.keys(answers).length / examData?.questions.length!) * 100);
      const attemptId = examData?.attempts?.[0]?.id;

      if (!attemptId) {
        toast.error("No attempt found");
        return;
      }

      const response = await fetch(`/api/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: score,
          answers: answers,
          tabSwitches: tabSwitches,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success("Exam submitted successfully!");
      } else {
        toast.error("Failed to submit exam");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Error submitting exam");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white text-center">
              Exam not found
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Exam Submitted!
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Your exam has been submitted successfully. Your score will be calculated by the instructor.
              </p>
              {tabSwitches > 0 && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                  Note: {tabSwitches} tab switch(es) detected during exam.
                </p>
              )}
            </div>
            <Button onClick={() => window.location.href = "/my-exams"} className="w-full">
              Back to Exams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = examData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === examData.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {examData.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Question {currentQuestionIndex + 1} of {examData.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <Card className="border border-slate-200 dark:border-slate-700 mb-8">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                  {currentQuestion.text || `Question ${currentQuestionIndex + 1}`}
                </h2>
              </div>

              <div>
                {currentQuestion.type === "MCQ" && (
                  <div className="space-y-3">
                    {["Option A", "Option B", "Option C", "Option D"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                      >
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={(e) =>
                            handleAnswerChange(currentQuestion.id, e.target.value)
                          }
                          className="h-4 w-4"
                        />
                        <span className="text-slate-900 dark:text-white">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === "TRUE_FALSE" && (
                  <div className="space-y-3">
                    {["True", "False"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                      >
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={(e) =>
                            handleAnswerChange(currentQuestion.id, e.target.value)
                          }
                          className="h-4 w-4"
                        />
                        <span className="text-slate-900 dark:text-white">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {(currentQuestion.type === "SHORT_ANSWER" ||
                  currentQuestion.type === "ESSAY") && (
                  <textarea
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, e.target.value)
                    }
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={currentQuestion.type === "ESSAY" ? 8 : 4}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={isFirstQuestion}
              variant="outline"
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {!isLastQuestion && (
              <Button
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(examData.questions.length - 1, prev + 1)
                  )
                }
                variant="outline"
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isLastQuestion && (
            <Button
              onClick={handleSubmitExam}
              disabled={submitting}
              size="lg"
              className="gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Exam
                </>
              )}
            </Button>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Progress: {Object.keys(answers).length} of{" "}
            {examData.questions.length} answered
          </p>
          <div className="flex gap-2 flex-wrap">
            {examData.questions.map((question, idx) => (
              <button
                key={question.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 rounded-lg font-semibold transition ${
                  currentQuestionIndex === idx
                    ? "bg-blue-600 text-white dark:bg-blue-700"
                    : answers[question.id]
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
