"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, User, Clock, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Attempt {
  id: string;
  score: number | null;
  submittedAt: string;
  user: { name: string; email: string };
  exam: { title: string; examType: string; term: string };
}

export default function GradingListPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const response = await fetch("/api/grading/attempts");
      if (response.ok) {
        const data = await response.json();
        setAttempts(data.attempts || []);
      }
    } catch (error) {
      console.error("Error fetching attempts:", error);
      toast.error("Failed to load attempts");
    } finally {
      setLoading(false);
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            Grading Queue
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Review and grade student exam submissions
          </p>
        </div>

        <div className="grid gap-4">
          {attempts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">All caught up!</h3>
                <p className="text-slate-600">No attempts waiting for grading.</p>
              </CardContent>
            </Card>
          ) : (
            attempts.map((attempt) => (
              <Card key={attempt.id} className="border border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">{attempt.user.name}</h3>
                        {attempt.score !== null && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                            Graded
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">{attempt.user.email}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{attempt.exam.title}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          attempt.exam.examType === 'CA' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {attempt.exam.examType}
                        </span>
                        <span>{attempt.exam.term} Term</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="h-4 w-4" />
                        Submitted: {new Date(attempt.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => redirect(`/grading/${attempt.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        Quick Grade
                      </Button>
                      <Button
                        onClick={() => redirect(`/grading/questions/${attempt.id}`)}
                        size="sm"
                        className="gap-2"
                      >
                        <BookOpen className="h-4 w-4" />
                        Grade Questions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}