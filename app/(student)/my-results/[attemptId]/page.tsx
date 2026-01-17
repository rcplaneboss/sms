"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  BookOpen,
  Award,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface QuestionDetail {
  id: string;
  text: string;
  type: string;
  marks: number;
  options?: { id: string; text: string; isCorrect: boolean }[];
  studentAnswer: string;
  marksAwarded: number;
  maxMarks: number;
  teacherComment?: string;
  isCorrect?: boolean;
}

interface ExamDetail {
  id: string;
  score: number;
  answers: Record<string, string>;
  createdAt: string;
  exam: {
    id: string;
    title: string;
    duration: number;
    subject: { name: string };
    program: {
      name: string;
      level: { name: string };
      track: { name: string };
    };
    questions: QuestionDetail[];
  };
}

export default function ExamDetailPage({
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
  const [examDetail, setExamDetail] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setAttemptId(p.attemptId));
  }, [params]);

  useEffect(() => {
    if (!attemptId) return;

    const fetchExamDetail = async () => {
      try {
        const response = await fetch(`/api/student/exam-details?attemptId=${attemptId}`);
        if (response.ok) {
          const data = await response.json();
          setExamDetail(data.attempt);
        } else {
          toast.error("Exam details not found");
          redirect("/my-results");
        }
      } catch (error) {
        console.error("Error fetching exam details:", error);
        toast.error("Failed to load exam details");
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetail();
  }, [attemptId]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!examDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <XCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white text-center">
              Exam details not found
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  const correctAnswers = examDetail.exam.questions.filter(q => q.isCorrect === true).length;
  const totalQuestions = examDetail.exam.questions.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Exam Results Detail
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {examDetail.exam.title}
            </p>
          </div>
        </div>

        {/* Exam Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Score</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {examDetail.score}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Correct</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {correctAnswers}/{totalQuestions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Subject</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {examDetail.exam.subject.name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Date</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {new Date(examDetail.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions Review */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Question-by-Question Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {examDetail.exam.questions.map((question, index) => (
              <div
                key={question.id}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Question {index + 1}
                  </h3>
                  <div className="flex items-center gap-2">
                    {question.isCorrect === true ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : question.isCorrect === false ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : null}
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {question.marksAwarded}/{question.maxMarks} marks
                    </span>
                  </div>
                </div>

                <p className="text-slate-900 dark:text-white mb-4">
                  {question.text}
                </p>

                {question.type === "MCQ" && question.options && (
                  <div className="space-y-2 mb-4">
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        className={`p-3 rounded-lg border ${
                          option.id === question.studentAnswer
                            ? option.isCorrect
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : option.isCorrect
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {option.id === question.studentAnswer && (
                            <span className="text-sm font-medium text-blue-600">
                              Your answer:
                            </span>
                          )}
                          {option.isCorrect && (
                            <span className="text-sm font-medium text-green-600">
                              Correct:
                            </span>
                          )}
                          <span className="text-slate-900 dark:text-white">
                            {option.text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(question.type === "SHORT_ANSWER" || question.type === "ESSAY") && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Your Answer:
                    </p>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-slate-900 dark:text-white">
                        {question.studentAnswer || "No answer provided"}
                      </p>
                    </div>
                  </div>
                )}

                {question.teacherComment && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Teacher Feedback:
                    </p>
                    <p className="text-blue-900 dark:text-blue-100">
                      {question.teacherComment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}