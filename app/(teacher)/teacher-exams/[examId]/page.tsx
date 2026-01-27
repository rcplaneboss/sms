"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Users, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Exam {
  id: string;
  title: string;
  duration: number;
  examType: string;
  createdAt: string;
  academicTerm: {
    name: string;
    year: string;
  };
  program?: { name: string };
  subject?: { name: string };
  level?: { name: string };
  track?: { name: string };
  _count: {
    questions: number;
    attempts: number;
  };
}

export default function ExamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExam();
  }, [params.examId]);

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/exams/${params.examId}`);
      if (response.ok) {
        const data = await response.json();
        setExam(data);
      } else {
        toast.error("Failed to load exam details");
      }
    } catch (error) {
      toast.error("Error loading exam");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Exam not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              {exam.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {exam?.academicTerm?.name} {exam?.academicTerm?.year}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{exam.duration} minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{exam?._count?.questions}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{exam?._count?.attempts}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Type</label>
                <Badge variant={exam.examType === "EXAM" ? "default" : "secondary"} className="ml-2">
                  {exam.examType === "EXAM" ? "Examination" : "Continuous Assessment"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Created</label>
                <p className="text-slate-900 dark:text-white">
                  {new Date(exam.createdAt).toLocaleDateString()}
                </p>
              </div>
              {exam.program && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Program</label>
                  <p className="text-slate-900 dark:text-white">{exam.program.name}</p>
                </div>
              )}
              {exam.subject && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Subject</label>
                  <p className="text-slate-900 dark:text-white">{exam.subject.name}</p>
                </div>
              )}
              {exam.level && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Level</label>
                  <p className="text-slate-900 dark:text-white">{exam.level.name}</p>
                </div>
              )}
              {exam.track && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Track</label>
                  <p className="text-slate-900 dark:text-white">{exam.track.name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push(`/teacher-exams/${exam.id}/questions`)}
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Manage Questions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}