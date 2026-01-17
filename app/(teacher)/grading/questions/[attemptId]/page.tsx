"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, Save, BookOpen, User, FileText } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  type: string;
  marks: number;
  options?: { id: string; text: string; isCorrect: boolean }[];
}

interface QuestionGrade {
  id: string;
  questionId: string;
  studentAnswer: string | null;
  marksAwarded: number;
  maxMarks: number;
  teacherComment: string | null;
}

interface AttemptData {
  id: string;
  user: { id: string; name: string; email: string };
  exam: { id: string; title: string; examType: string; term: string };
  score: number | null;
  answers: any;
  questionGrades: QuestionGrade[];
}

export default function QuestionGradingPage({
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
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [grades, setGrades] = useState<{ [questionId: string]: { marks: number; comment: string } }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    params.then((p) => setAttemptId(p.attemptId));
  }, [params]);

  useEffect(() => {
    if (!attemptId) return;
    fetchAttemptData();
  }, [attemptId]);

  const fetchAttemptData = async () => {
    try {
      const response = await fetch(`/api/grading/questions?attemptId=${attemptId}`);
      if (response.ok) {
        const data = await response.json();
        setAttempt(data.attempt);
        setQuestions(data.attempt.exam.questions);
        
        // Initialize grades from existing data
        const initialGrades: { [questionId: string]: { marks: number; comment: string } } = {};
        data.attempt.questionGrades.forEach((grade: QuestionGrade) => {
          initialGrades[grade.questionId] = {
            marks: grade.marksAwarded,
            comment: grade.teacherComment || ""
          };
        });
        setGrades(initialGrades);
      } else {
        toast.error("Attempt not found");
        redirect("/grading");
      }
    } catch (error) {
      console.error("Error fetching attempt:", error);
      toast.error("Failed to load attempt");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (questionId: string, field: 'marks' | 'comment', value: string | number) => {
    setGrades(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId] || { marks: 0, comment: "" },
        [field]: value
      }
    }));
  };

  const handleSaveGrades = async () => {
    setSaving(true);
    try {
      const promises = questions.map(async (question) => {
        const grade = grades[question.id];
        if (!grade) return;

        return fetch("/api/grading/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId,
            questionId: question.id,
            marksAwarded: grade.marks,
            maxMarks: question.marks,
            teacherComment: grade.comment
          }),
        });
      });

      await Promise.all(promises);
      toast.success("Grades saved successfully");
      redirect("/grading");
    } catch (error) {
      console.error("Error saving grades:", error);
      toast.error("Failed to save grades");
    } finally {
      setSaving(false);
    }
  };

  const getStudentAnswer = (questionId: string) => {
    if (!attempt?.answers) return "No answer provided";
    const answers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers;
    return answers[questionId] || "No answer provided";
  };

  const getTotalMarks = () => {
    return questions.reduce((total, q) => total + q.marks, 0);
  };

  const getAwardedMarks = () => {
    return Object.values(grades).reduce((total, grade) => total + (grade?.marks || 0), 0);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            Grade Questions
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Grade each question individually for detailed feedback
          </p>
        </div>

        {/* Student & Exam Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Student Information</h3>
              </div>
              <p><strong>Name:</strong> {attempt.user.name}</p>
              <p><strong>Email:</strong> {attempt.user.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Exam Information</h3>
              </div>
              <p><strong>Title:</strong> {attempt.exam.title}</p>
              <p><strong>Type:</strong> {attempt.exam.examType}</p>
              <p><strong>Term:</strong> {attempt.exam.term}</p>
            </CardContent>
          </Card>
        </div>

        {/* Grading Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Grading Progress</h3>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {getAwardedMarks()} / {getTotalMarks()}
                </p>
                <p className="text-sm text-slate-600">Total Marks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id} className="border border-slate-200 dark:border-slate-700">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">
                      Question {index + 1} ({question.marks} marks)
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 mb-4">
                      {question.text}
                    </p>
                    
                    {question.type === "MCQ" && question.options && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Options:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {question.options.map((option) => (
                            <li key={option.id} className={`text-sm ${option.isCorrect ? 'text-green-600 font-medium' : 'text-slate-600'}`}>
                              {option.text} {option.isCorrect && "(Correct)"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="font-medium mb-2">Student Answer:</p>
                    <p className="text-slate-700 dark:text-slate-300">
                      {getStudentAnswer(question.id)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Marks Awarded (Max: {question.marks})
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max={question.marks}
                        value={grades[question.id]?.marks || 0}
                        onChange={(e) => handleGradeChange(question.id, 'marks', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Teacher Comment
                      </label>
                      <Input
                        value={grades[question.id]?.comment || ""}
                        onChange={(e) => handleGradeChange(question.id, 'comment', e.target.value)}
                        placeholder="Optional feedback..."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveGrades}
            disabled={saving}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save All Grades
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}