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


// --- Interface Definitions ---

interface Level {
  id: string;
  name: string;
}

interface Track {
  id: string;
  name: string;
}



interface Subject {
  id: string;
  name: string;
}


interface Program {
  id: string;
  name: string;
  description?: string;
  levelId: string;
  trackId: string;
  subjects: Subject[];
}

interface Exam {
  id: string;
  title: string;
  createdById: string;
  questions: { id: string; text: string; type: string; options?: { id: string; text: string; isCorrect: boolean }[] }[];
  track: Track | null;
  level: Level | null;
  program: Program | null;
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

  const [programs, setPrograms] = useState<Program[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState("");
  const [newExamProgram, setNewExamProgram] = useState("");
  const [newExamTrack, setNewExamTrack] = useState("");
  const [newExamLevel, setNewExamLevel] = useState("");
  const [newExamSubject, setNewExamSubject] = useState("");
  const [newExamDuration, setNewExamDuration] = useState("60");
  const [newExamType, setNewExamType] = useState("EXAM");
  const [newExamTerm, setNewExamTerm] = useState("FIRST");
  const [expandedExam, setExpandedExam] = useState<string | null>(null);
  const [editingExam, setEditingExam] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("MCQ");
  const [newOptions, setNewOptions] = useState<{ text: string; isCorrect: boolean }[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editQuestionOptions, setEditQuestionOptions] = useState<{ id: string; text: string; isCorrect: boolean }[]>([]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchExams();
    }
  }, [session?.user?.role]);

  const fetchData = async () => {
    setLoading(true);
    try {

      const [programsRes, levelsRes, tracksRes, subjectsRes] =
        await Promise.all([
          fetch("/api/programs"),
          fetch("/api/levels"),
          fetch("/api/tracks"),
          fetch("/api/subjects"),
        ]);

      if (
        !programsRes.ok ||
        !levelsRes.ok ||
        !tracksRes.ok ||
        !subjectsRes.ok
      ) {
        throw new Error("Failed to fetch data");
      }

      const programsData: Program[] = await programsRes.json();
      const levelsData: Level[] = await levelsRes.json();
      const tracksData: Track[] = await tracksRes.json();
      const subjectsData: Subject[] = await subjectsRes.json();

      setPrograms(programsData);
      setLevels(levelsData);
      setTracks(tracksData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams");
      if (response.ok) {
        const data = await response.json();
        setExams(data);
        console.log("Fetched exams:", data);
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

    if (!newExamProgram) {
      toast.error("Program is required");
      return;
    }

    if (!newExamLevel) {
      toast.error("Level is required");
      return;
    }

    if (!newExamTrack) {
      toast.error("Track is required");
      return;
    }

    if (!newExamSubject) {
      toast.error("Subject is required");
      return;
    }
    setCreating(true);
    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newExamTitle,
          programId: newExamProgram,
          levelId: newExamLevel,
          trackId: newExamTrack,
          subjectId: newExamSubject,
          duration: parseInt(newExamDuration),
          examType: newExamType,
          term: newExamTerm,
        }),
      });

      if (response.ok) {
        const newExam = await response.json();
        setExams([newExam, ...exams]);
        setNewExamTitle("");
        setNewExamSubject("");
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
        body: JSON.stringify({ 
          title: editTitle,
          duration: parseInt(editDuration) || 60
        }),
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

    if (newQuestionType === "MCQ") {
      const hasEmptyOption = newOptions.some(opt => !opt.text.trim());
      if (hasEmptyOption) {
        toast.error("All MCQ options must have text");
        return;
      }
      const hasCorrectAnswer = newOptions.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        toast.error("At least one MCQ option must be marked as correct");
        return;
      }
    }

    try {
      const response = await fetch(`/api/exams/${examId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newQuestionText,
          type: newQuestionType,
          options: newQuestionType === "MCQ" ? newOptions : undefined,
        }),
      });

      if (response.ok) {
        fetchExams();
        setNewQuestionText("");
        setNewQuestionType("MCQ");
        setNewOptions([
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ]);
        toast.success("Question added");
      } else {
        toast.error("Failed to add question");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Error adding question");
    }
  };

  const handleEditQuestion = async (examId: string, questionId: string) => {
    if (!editQuestionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    try {
      const response = await fetch(`/api/exams/${examId}/questions/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: editQuestionText,
          options: editQuestionOptions,
        }),
      });

      if (response.ok) {
        fetchExams();
        setEditingQuestionId(null);
        toast.success("Question updated");
      } else {
        toast.error("Failed to update question");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Error updating question");
    }
  };

  const handleDeleteQuestion = async (examId: string, questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await fetch(`/api/exams/${examId}/questions/${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchExams();
        toast.success("Question deleted");
      } else {
        toast.error("Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Error deleting question");
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
                <div className="w-full">
                  <Input
                    placeholder="Exam title (e.g., Mathematics Final Exam)"
                    value={newExamTitle}
                    onChange={(e) => setNewExamTitle(e.target.value)}
                    disabled={creating}
                  />
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={newExamDuration}
                      onChange={(e) => setNewExamDuration(e.target.value)}
                      disabled={creating}
                      min="1"
                      className="w-48"
                    />
                    <div className="flex gap-2 mt-2">
                      <select
                        value={newExamType}
                        onChange={(e) => setNewExamType(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        disabled={creating}
                      >
                        <option value="EXAM">Exam</option>
                        <option value="CA">Continuous Assessment</option>
                      </select>
                      <select
                        value={newExamTerm}
                        onChange={(e) => setNewExamTerm(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        disabled={creating}
                      >
                        <option value="FIRST">First Term</option>
                        <option value="SECOND">Second Term</option>
                        <option value="THIRD">Third Term</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex max-md:flex-col mt-2 gap-4 w-full">
                    <div className="">
                      <select name="program" id="program" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" defaultValue=""
                        onChange={(e) => setNewExamProgram(e.target.value)}
                      >
                        <option value="" disabled>Select a program</option>
                        {programs.map((program) => (
                          <option key={program.id} value={program.id}>
                            {program.name}
                          </option>
                        ))}
                      </select>
                    </div>

                 

                        <div className="">
                          <select name="subject" id="subject" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" defaultValue='' onChange={(e)=>{
                            setNewExamSubject(e.target.value)
                          }}>
                            <option value="" disabled>Select a subject</option>
                            {subjects.map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name}
                              </option>
                            ))}
                          </select>
                    </div>

                    <div className="">
                      <select name="level" id="level" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" defaultValue='' onChange={(e)=>{
                        setNewExamLevel(e.target.value)
                      }}>
                          <option value="" disabled>Select a level</option>
                        {levels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="">
                     
                      <select name="track" id="track" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" defaultValue='' onChange={(e)=>{
                        setNewExamTrack(e.target.value)
                      }}>
                        <option value="" disabled>Select a track</option>
                        {tracks.map((track) => (
                          <option key={track.id} value={track.id}>
                            {track.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

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
                          <div className="space-y-2">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Exam title"
                            />
                            <Input
                              type="number"
                              value={editDuration}
                              onChange={(e) => setEditDuration(e.target.value)}
                              placeholder="Duration (minutes)"
                              min="1"
                              className="w-48"
                            />
                          </div>
                        ) : (
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {exam.title}
                          </h3>
                        )}
                        <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400 mt-2">
                          <span>{exam?.program?.name}</span> - 
                          <span>{exam?.level?.name}</span> -
                          <span>{exam?.track?.name}</span>
                        </div>
                        <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            exam.examType === 'CA' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {exam.examType === 'CA' ? 'Continuous Assessment' : 'Examination'}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {exam.term} Term
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-400 mt-2">
                          <span>{exam.questions.length} questions</span>
                          {/* <span>{exam.attempts.length} attempts</span> */}
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
                                setEditDuration(exam.duration?.toString() || "60");
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
                            onChange={(e) => {
                              setNewQuestionType(e.target.value);
                              // Reset options when type changes
                              if (e.target.value !== "MCQ") {
                                setNewOptions([
                                  { text: "", isCorrect: false },
                                  { text: "", isCorrect: false },
                                ]);
                              }
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          >
                            <option value="MCQ">
                              Multiple Choice
                            </option>
                            <option value="TRUE_FALSE">True/False</option>
                            <option value="SHORT_ANSWER">Short Answer</option>
                            <option value="ESSAY">Essay</option>
                          </select>

                          {/* MCQ Options Section */}
                          {newQuestionType === "MCQ" && (
                            <div className="space-y-3 bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                              <h5 className="font-medium text-sm text-slate-900 dark:text-white">
                                Options
                              </h5>
                              {newOptions.map((option, idx) => (
                                <div
                                  key={idx}
                                  className="flex gap-2 items-center"
                                >
                                  <Input
                                    placeholder={`Option ${idx + 1}`}
                                    value={option.text}
                                    onChange={(e) => {
                                      const updated = [...newOptions];
                                      updated[idx].text = e.target.value;
                                      setNewOptions(updated);
                                    }}
                                    className="flex-1"
                                  />
                                  <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                                    <input
                                      type="checkbox"
                                      checked={option.isCorrect}
                                      onChange={(e) => {
                                        const updated = [...newOptions];
                                        updated[idx].isCorrect = e.target.checked;
                                        setNewOptions(updated);
                                      }}
                                      className="w-4 h-4 rounded"
                                    />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                      Correct
                                    </span>
                                  </label>
                                </div>
                              ))}
                              <Button
                                onClick={() =>
                                  setNewOptions([
                                    ...newOptions,
                                    { text: "", isCorrect: false },
                                  ])
                                }
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Option
                              </Button>
                            </div>
                          )}

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
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {exam.questions.map((question, idx) => (
                              <div
                                key={question.id}
                                className="p-4 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                              >
                                {editingQuestionId === question.id ? (
                                  // Edit Mode
                                  <div className="space-y-3">
                                    <Input
                                      value={editQuestionText}
                                      onChange={(e) =>
                                        setEditQuestionText(e.target.value)
                                      }
                                      placeholder="Question text"
                                    />

                                    {question.type === "MCQ" && editQuestionOptions.length > 0 && (
                                      <div className="space-y-2 bg-white dark:bg-slate-700 p-3 rounded">
                                        <h6 className="text-sm font-medium text-slate-900 dark:text-white">
                                          Options
                                        </h6>
                                        {editQuestionOptions.map((opt, optIdx) => (
                                          <div key={opt.id} className="flex gap-2 items-center">
                                            <input
                                              type="text"
                                              value={opt.text}
                                              onChange={(e) => {
                                                const updated = [...editQuestionOptions];
                                                updated[optIdx].text = e.target.value;
                                                setEditQuestionOptions(updated);
                                              }}
                                              placeholder={`Option ${optIdx + 1}`}
                                              className="flex-1 px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                                            />
                                            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                                              <input
                                                type="checkbox"
                                                checked={opt.isCorrect}
                                                onChange={(e) => {
                                                  const updated = [...editQuestionOptions];
                                                  updated[optIdx].isCorrect =
                                                    e.target.checked;
                                                  setEditQuestionOptions(updated);
                                                }}
                                                className="w-4 h-4 rounded"
                                              />
                                              <span className="text-xs text-slate-600 dark:text-slate-400">
                                                Correct
                                              </span>
                                            </label>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updated = editQuestionOptions.filter((_, i) => i !== optIdx);
                                                setEditQuestionOptions(updated);
                                              }}
                                              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>
                                        ))}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditQuestionOptions([
                                              ...editQuestionOptions,
                                              { id: `new-${Date.now()}`, text: "", isCorrect: false }
                                            ]);
                                          }}
                                          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
                                        >
                                          <Plus className="h-3 w-3" />
                                          Add Option
                                        </button>
                                      </div>
                                    )}

                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() =>
                                          handleEditQuestion(exam.id, question.id)
                                        }
                                        variant="default"
                                        size="sm"
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        onClick={() => setEditingQuestionId(null)}
                                        variant="outline"
                                        size="sm"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  // View Mode
                                  <div>
                                    <div className="flex justify-between items-start mb-2 flex-col sm:flex-row sm:items-center gap-3" >
                                      <p className="flex max-md:flex-col justify-between text-sm font-medium text-slate-900 dark:text-white w-full">
                                        <div className=""><strong>Q{idx + 1}:</strong> {question.text}</div>
                                        <div className="">QuestionType: {question.type}</div>
                                      </p>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => {
                                            setEditingQuestionId(question.id);
                                            setEditQuestionText(question.text);
                                            setEditQuestionOptions(
                                              question.options || []
                                            );
                                          }}
                                          variant="outline"
                                          size="sm"
                                          className="gap-1"
                                        >
                                          <Edit className="h-3 w-3" />
                                          Edit
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            handleDeleteQuestion(
                                              exam.id,
                                              question.id
                                            )
                                          }
                                          variant="outline"
                                          size="sm"
                                          className="gap-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>

                                    {question.type === "MCQ" &&
                                      question.options &&
                                      question.options.length > 0 && (
                                        <ul className="mt-2 list-disc list-inside text-sm text-slate-700 dark:text-slate-300 ml-2">
                                          {question.options.map((opt) => (
                                            <li
                                              key={opt.id}
                                              className="flex items-center gap-2"
                                            >
                                              <span>{opt.text}</span>
                                              {opt.isCorrect && (
                                                <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                                                  (correct)
                                                </span>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                  </div>
                                )}
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
