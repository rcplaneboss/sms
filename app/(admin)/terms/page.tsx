"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Plus, Edit, Trash2, Eye, EyeOff, CheckCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AcademicTerm {
  id: string;
  name: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPublished: boolean;
  publishedAt?: string;
  publishedBy?: string;
  _count: {
    exams: number;
  };
}

export default function TermManagementPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTerm, setEditingTerm] = useState<AcademicTerm | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({
    name: "FIRST",
    year: "2024/2025",
    startDate: "",
    endDate: "",
    isActive: false,
  });

  useEffect(() => {
    
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await fetch("/api/admin/terms");
      if (response.ok) {
        const data = await response.json();
        setTerms(data.terms);
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
      toast.error("Failed to load terms");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      const url = editingTerm ? `/api/admin/terms/${editingTerm.id}` : "/api/admin/terms";
      const method = editingTerm ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        toast.success(`Term ${editingTerm ? "updated" : "created"} successfully`);
        fetchTerms();
        setShowDialog(false);
        resetForm();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to save term");
      }
    } catch (error) {
      toast.error("Error saving term");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (termId: string, action: "publish" | "unpublish") => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/terms/${termId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        toast.success(`Term ${action}ed successfully`);
        fetchTerms();
      } else {
        const data = await response.json();
        toast.error(data.error || `Failed to ${action} term`);
      }
    } catch (error) {
      toast.error(`Error ${action}ing term`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (termId: string) => {
    if (!confirm("Are you sure you want to delete this term?")) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/terms/${termId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Term deleted successfully");
        fetchTerms();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete term");
      }
    } catch (error) {
      toast.error("Error deleting term");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "FIRST",
      year: "2024/2025",
      startDate: "",
      endDate: "",
      isActive: false,
    });
    setEditingTerm(null);
  };

  const openEditDialog = (term: AcademicTerm) => {
    setEditingTerm(term);
    setForm({
      name: term.name,
      year: term.year,
      startDate: term.startDate.split("T")[0],
      endDate: term.endDate.split("T")[0],
      isActive: term.isActive,
    });
    setShowDialog(true);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              Academic Terms
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage academic terms and control exam/report publishing
            </p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Term
          </Button>
        </div>

        <div className="grid gap-6">
          {terms.map((term) => (
            <Card key={term.id} className="shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {term.name.replace("_", " ")} Term {term.year}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {term.isActive && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                        {term.isPublished ? (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <Eye className="h-3 w-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Unpublished
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {term._count.exams} exams
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={term.isPublished ? "outline" : "default"}
                      size="sm"
                      onClick={() => handlePublish(term.id, term.isPublished ? "unpublish" : "publish")}
                      disabled={actionLoading}
                      className="gap-2"
                    >
                      {term.isPublished ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Publish
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(term)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(term.id)}
                      disabled={term._count.exams > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTerm ? "Edit Term" : "Add New Term"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Term Name</Label>
                <Select value={form.name} onValueChange={(value) => setForm({ ...form, name: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIRST">First Term</SelectItem>
                    <SelectItem value="SECOND">Second Term</SelectItem>
                    <SelectItem value="THIRD">Third Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year">Academic Year</Label>
                <Input
                  id="year"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  placeholder="2024/2025"
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Set as active term</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={actionLoading}>
                {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingTerm ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}