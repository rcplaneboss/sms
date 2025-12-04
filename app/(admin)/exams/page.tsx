"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Loader2,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Exam {
  id: string;
  title: string;
  createdById: string;
  questions: { id: string }[];
  createdBy: { name: string };
  attempts: { id: string; score: number | null }[];
  createdAt: string;
}

export default function AdminExamsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState("");
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [editingExam, setEditingExam] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("MULTIPLE_CHOICE");

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchExams();
    }
  }, [session?.user?.role]);

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

  const handleCreateExam = async () => {
    if (!newExamTitle.trim()) {
      toast.error("Exam title is required");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newExamTitle }),
      });

      if (response.ok) {
        const newExam = await response.json();
        setExams([newExam, ...exams]);
        setNewExamTitle("");
        toast.success("Exam created successfully");
      } else {
        toast.error("Failed to create exam");
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("Error creating exam");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setExams(exams.filter((e) => e.id !== examId));
        toast.success("Exam deleted");
      } else {
        toast.error("Failed to delete exam");
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Error deleting exam");
    }
  };

  const handleUpdateExam = async (examId: string) => {
    if (!editTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });

      if (response.ok) {
        const updated = await response.json();
        setExams(exams.map((e) => (e.id === examId ? updated : e)));
        setEditingExam(null);
        toast.success("Exam updated");
      } else {
        toast.error("Failed to update exam");
      }
    } catch (error) {
      console.error("Error updating exam:", error);
      toast.error("Error updating exam");
    }
  };

  const handleAddQuestion = async (examId: string) => {
    if (!newQuestionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    try {
      const response = await fetch(`/api/exams/${examId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newQuestionText,
          type: newQuestionType,
        }),
      });

      if (response.ok) {
        fetchExams();
        setNewQuestionText("");
        toast.success("Question added");
      } else {
        toast.error("Failed to add question");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Error adding question");
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
            Manage Exams
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Create and manage exams for students
          </p>
        </div>

        {/* Create New Exam */}
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Create New Exam
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Exam title (e.g., Mathematics Final Exam)"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  disabled={creating}
                />
                <Button
                  onClick={handleCreateExam}
                  disabled={creating}
                  className="gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exams List */}
        <div className="space-y-4">
          {exams.length === 0 ? (
            <Card className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  No exams yet
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Create your first exam to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            exams.map((exam) => (
              <div key={exam.id}>
                <Card className="border border-slate-200 dark:border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        {editingExam === exam.id ? (
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="mb-2"
                          />
                        ) : (
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {exam.title}
                          </h3>
                        )}
                        <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400 mt-2">
                          <span>{exam.questions.length} questions</span>
                          <span>{exam.attempts.length} attempts</span>
                          <span>By {exam.createdBy.name}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {editingExam === exam.id ? (
                          <>
                            <Button
                              onClick={() =>
                                handleUpdateExam(exam.id)
                              }
                              variant="default"
                              size="sm"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingExam(null)}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => {
                                setEditingExam(exam.id);
                                setEditTitle(exam.title);
                              }}
                              variant="outline"
                              size="sm"
                              className="gap-1"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteExam(exam.id)}
                              variant="outline"
                              size="sm"
                              className="gap-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </>
                        )}

                        <Button
                          onClick={() =>
                            setExpandedExam(
                              expandedExam === exam.id ? null : exam.id
                            )
                          }
                          variant="outline"
                          size="sm"
                        >
                          {expandedExam === exam.id ? "Hide" : "Manage"} Questions
                        </Button>
                      </div>
                    </div>

                    {/* Questions Section */}
                    {expandedExam === exam.id && (
                      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          Questions
                        </h4>

                        {/* Add Question Form */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg space-y-3">
                          <Input
                            placeholder="Question text"
                            value={newQuestionText}
                            onChange={(e) =>
                              setNewQuestionText(e.target.value)
                            }
                          />
                          <select
                            value={newQuestionType}
                            onChange={(e) =>
                              setNewQuestionType(e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          >
                            <option value="MULTIPLE_CHOICE">
                              Multiple Choice
                            </option>
                            <option value="TRUE_FALSE">True/False</option>
                            <option value="SHORT_ANSWER">Short Answer</option>
                            <option value="ESSAY">Essay</option>
                          </select>
                          <Button
                            onClick={() => handleAddQuestion(exam.id)}
                            className="w-full"
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                          </Button>
                        </div>

                        {/* Questions List */}
                        {exam.questions.length === 0 ? (
                          <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No questions yet. Add your first question.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-80 overflow-y-auto">
                            {exam.questions.map((question, idx) => (
                              <div
                                key={question.id}
                                className="p-3 bg-slate-100 dark:bg-slate-800 rounded"
                              >
                                <p className="text-sm text-slate-900 dark:text-white">
                                  <strong>Q{idx + 1}:</strong> {/* Question text would be here */}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
