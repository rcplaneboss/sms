"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AcademicTerm {
  id: string;
  name: string;
  year: string;
  isActive: boolean;
  isPublished: boolean;
}

interface Program {
  id: string;
  name: string;
}

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

export default function CreateExamPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [form, setForm] = useState({
    title: "",
    programId: "",
    levelId: "",
    trackId: "",
    subjectId: "",
    duration: "60",
    examType: "EXAM",
    academicTermId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const dashboardRes = await fetch("/api/teacher/dashboard");

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        
        setTerms(dashboardData.terms || []);
        setPrograms(dashboardData.programs || []);
        setLevels(dashboardData.levels || []);
        setTracks(dashboardData.tracks || []);
        setSubjects(dashboardData.subjects || []);
      } else {
        toast.error("Failed to load form data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast.error("Exam title is required");
      return;
    }
    
    if (!form.academicTermId) {
      toast.error("Academic term is required");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duration: parseInt(form.duration)
        }),
      });

      if (response.ok) {
        toast.success("Exam created successfully");
        setForm({
          title: "",
          programId: "",
          levelId: "",
          trackId: "",
          subjectId: "",
          duration: "60",
          examType: "EXAM",
          academicTermId: "",
        });
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create exam");
      }
    } catch (error) {
      toast.error("Error creating exam");
    } finally {
      setCreating(false);
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
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Create New Exam
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Create a new exam for your students
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Exam Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Mathematics Final Exam"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="examType">Exam Type</Label>
                  <select
                    id="examType"
                    value={form.examType}
                    onChange={(e) => setForm({ ...form, examType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="EXAM">Examination</option>
                    <option value="CA">Continuous Assessment</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="academicTerm">Academic Term</Label>
                <select
                  id="academicTerm"
                  value={form.academicTermId}
                  onChange={(e) => setForm({ ...form, academicTermId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select academic term</option>
                  {terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term.name} {term.year} {term.isActive ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="program">Program</Label>
                  <select
                    id="program"
                    value={form.programId}
                    onChange={(e) => setForm({ ...form, programId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Select program</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    value={form.subjectId}
                    onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level">Level</Label>
                  <select
                    id="level"
                    value={form.levelId}
                    onChange={(e) => setForm({ ...form, levelId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Select level</option>
                    {levels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="track">Track</Label>
                  <select
                    id="track"
                    value={form.trackId}
                    onChange={(e) => setForm({ ...form, trackId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Select track</option>
                    {tracks.map((track) => (
                      <option key={track.id} value={track.id}>
                        {track.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button type="submit" disabled={creating} className="w-full">
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Exam...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Exam
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
