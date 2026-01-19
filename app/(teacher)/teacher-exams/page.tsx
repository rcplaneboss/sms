"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Clock, Users, Eye, Loader2 } from "lucide-react";
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
  _count: {
    questions: number;
    attempts: number;
  };
}

export default function TeacherExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/teacher/exams");
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      } else {
        toast.error("Failed to load exams");
      }
    } catch (error) {
      toast.error("Error loading exams");
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              My Exams
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage your exams and questions
            </p>
          </div>
          <Button onClick={() => router.push("/teacher/teacher-exams/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Exam
          </Button>
        </div>

        {exams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No exams yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Create your first exam to get started
              </p>
              <Button onClick={() => router.push("/teacher/teacher-exams/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{exam.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={exam.examType === "EXAM" ? "default" : "secondary"}>
                      {exam.examType === "EXAM" ? "Exam" : "CA"}
                    </Badge>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {exam.academicTerm.name} {exam.academicTerm.year}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span>{exam.duration}min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-slate-500" />
                      <span>{exam._count.questions} questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>{exam._count.attempts} attempts</span>
                    </div>
                  </div>
                  
                  {exam.program && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {exam.program.name} {exam.subject && `• ${exam.subject.name}`}
                    </p>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/teacher/teacher-exams/${exam.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}