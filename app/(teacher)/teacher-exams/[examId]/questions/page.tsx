"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  BookOpen,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  type: string;
  marks: number;
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

interface Exam {
  id: string;
  title: string;
  duration: number;
  examType: string;
  questions: Question[];
  program?: { name: string };
  subject?: { name: string };
}

export default function ExamQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "MCQ",
    marks: 1,
    options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }]
  });
  
  const [editQuestion, setEditQuestion] = useState({
    text: "",
    marks: 1,
    options: [] as Array<{ id?: string; text: string; isCorrect: boolean }>
  });

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}`);
      if (response.ok) {
        const data = await response.json();
        setExam(data);
      } else {
        toast.error("Failed to load exam");
      }
    } catch (error) {
      toast.error("Error loading exam");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.text.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (newQuestion.type === "MCQ" && !newQuestion.options.some(opt => opt.isCorrect)) {
      toast.error("At least one option must be correct");
      return;
    }

    try {
      const response = await fetch(`/api/exams/${examId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });

      if (response.ok) {
        toast.success("Question added successfully");
        setShowAddForm(false);
        setNewQuestion({
          text: "",
          type: "MCQ",
          marks: 1,
          options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }]
        });
        fetchExam();
      } else {
        toast.error("Failed to add question");
      }
    } catch (error) {
      toast.error("Error adding question");
    }
  };

  const handleUpdateQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/exams/${examId}/questions/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editQuestion),
      });

      if (response.ok) {
        toast.success("Question updated successfully");
        setEditingId(null);
        fetchExam();
      } else {
        toast.error("Failed to update question");
      }
    } catch (error) {
      toast.error("Error updating question");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await fetch(`/api/exams/${examId}/questions/${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Question deleted successfully");
        fetchExam();
      } else {
        toast.error("Failed to delete question");
      }
    } catch (error) {
      toast.error("Error deleting question");
    }
  };

  const startEdit = (question: Question) => {
    setEditingId(question.id);
    setEditQuestion({
      text: question.text,
      marks: question.marks,
      options: question.options || []
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Exam Not Found
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.back()} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                Manage Questions
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {exam.title} • {exam.questions.length} questions
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>

        {/* Exam Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm text-slate-600 dark:text-slate-400">Duration</Label>
                <p className="font-medium">{exam.duration} minutes</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600 dark:text-slate-400">Type</Label>
                <Badge variant={exam.examType === "EXAM" ? "default" : "secondary"}>
                  {exam.examType}
                </Badge>
              </div>
              <div>
                <Label className="text-sm text-slate-600 dark:text-slate-400">Program</Label>
                <p className="font-medium">{exam.program?.name || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600 dark:text-slate-400">Subject</Label>
                <p className="font-medium">{exam.subject?.name || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Question Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Question Text</Label>
                <Input
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  placeholder="Enter your question..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Question Type</Label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  >
                    <option value="MCQ">Multiple Choice</option>
                    <option value="TRUE_FALSE">True/False</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                    <option value="ESSAY">Essay</option>
                  </select>
                </div>
                <div>
                  <Label>Marks</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newQuestion.marks}
                    onChange={(e) => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              
              {newQuestion.type === "MCQ" && (
                <div className="space-y-3">
                  <Label>Options</Label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={option.text}
                        onChange={(e) => {
                          const updated = [...newQuestion.options];
                          updated[index].text = e.target.value;
                          setNewQuestion({ ...newQuestion, options: updated });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) => {
                            const updated = [...newQuestion.options];
                            updated[index].isCorrect = e.target.checked;
                            setNewQuestion({ ...newQuestion, options: updated });
                          }}
                        />
                        <span className="text-sm">Correct</span>
                      </label>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setNewQuestion({
                      ...newQuestion,
                      options: [...newQuestion.options, { text: "", isCorrect: false }]
                    })}
                  >
                    Add Option
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={handleAddQuestion}>Add Question</Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {exam.questions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No questions yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Add your first question to get started
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            exam.questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="pt-6">
                  {editingId === question.id ? (
                    <div className="space-y-4">
                      <Input
                        value={editQuestion.text}
                        onChange={(e) => setEditQuestion({ ...editQuestion, text: e.target.value })}
                      />
                      <Input
                        type="number"
                        min="1"
                        value={editQuestion.marks}
                        onChange={(e) => setEditQuestion({ ...editQuestion, marks: parseInt(e.target.value) || 1 })}
                        className="w-24"
                      />
                      {question.type === "MCQ" && editQuestion.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex gap-2 items-center">
                          <Input
                            value={option.text}
                            onChange={(e) => {
                              const updated = [...editQuestion.options];
                              updated[optIndex].text = e.target.value;
                              setEditQuestion({ ...editQuestion, options: updated });
                            }}
                          />
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={(e) => {
                                const updated = [...editQuestion.options];
                                updated[optIndex].isCorrect = e.target.checked;
                                setEditQuestion({ ...editQuestion, options: updated });
                              }}
                            />
                            <span className="text-sm">Correct</span>
                          </label>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdateQuestion(question.id)} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setEditingId(null)} 
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              Q{index + 1}
                            </span>
                            <Badge variant="outline">{question.type}</Badge>
                            <Badge variant="secondary">{question.marks} marks</Badge>
                          </div>
                          <p className="text-slate-900 dark:text-white font-medium mb-3">
                            {question.text}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startEdit(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {question.type === "MCQ" && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={option.id} className="flex items-center gap-2 text-sm">
                              {option.isCorrect ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border border-slate-300" />
                              )}
                              <span className={option.isCorrect ? "font-medium text-green-700 dark:text-green-400" : "text-slate-600 dark:text-slate-400"}>
                                {String.fromCharCode(65 + optIndex)}. {option.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}