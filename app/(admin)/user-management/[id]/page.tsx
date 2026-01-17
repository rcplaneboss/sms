"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  GraduationCap,
  BookOpen,
  Activity,
  FileText,
  Settings,
  Loader2,
  Edit,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  createdAt: string;
  image?: string;
  StudentProfile?: {
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
    age: string;
    gender: string;
    address: string;
    guardianName?: string;
    guardianContact?: string;
    previousEducation?: string;
  };
  TeacherProfile?: {
    fullName: string;
    phoneNumber: string;
    address?: string;
    highestDegree?: string;
    certifications: string[];
    experienceYears?: number;
    languages: string[];
    techSkills: string[];
    bio?: string;
    equipment?: string;
    acceptedTerms: boolean;
    paymentInfo?: {
      bankName: string;
      accountName: string;
      accountNumber: string;
    };
  };
  enrollments?: {
    program: {
      name: string;
      level: { name: string };
      track: { name: string };
    };
  }[];
  attempts?: {
    exam: {
      title: string;
      createdAt: string;
    };
    score?: number;
    submittedAt?: string;
  }[];
  exams?: {
    title: string;
    createdAt: string;
    _count: {
      attempts: number;
    };
  }[];
  _count?: {
    attempts: number;
    exams: number;
    enrollments: number;
  };
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "STUDENT" });

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/access-denied");
      return;
    }
    fetchUser();
  }, [params.id, session]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setEditForm({
          name: data.user.name || "",
          email: data.user.email,
          role: data.user.role,
        });
      } else {
        toast.error("User not found");
        router.push("/user-management");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        toast.success("User updated successfully");
        setEditMode(false);
        fetchUser();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update user");
      }
    } catch (error) {
      toast.error("Error updating user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("User deleted successfully");
        router.push("/user-management");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Error deleting user");
    }
    setShowDeleteDialog(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "TEACHER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "STUDENT":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4" />;
      case "TEACHER":
        return <GraduationCap className="h-4 w-4" />;
      case "STUDENT":
        return <BookOpen className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/user-management")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User Management
          </Button>
        </div>
      </div>
    );
  }

  const displayName = user.StudentProfile?.fullName || user.TeacherProfile?.fullName || user.name || "No Name";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/user-management")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                {displayName}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${getRoleBadgeColor(user.role)} flex items-center gap-1`}>
                  {getRoleIcon(user.role)}
                  {user.role}
                </Badge>
                <span className="text-slate-600 dark:text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-400">{user.email}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!editMode ? (
              <Button onClick={() => setEditMode(true)} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit User
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </>
            )}
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Member Since</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {user.role === "STUDENT" && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Exam Attempts</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {user._count?.attempts || 0}
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
                      <p className="text-sm text-slate-600 dark:text-slate-400">Programs</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {user._count?.enrollments || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          {user.role === "TEACHER" && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Exams Created</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {user._count?.exams || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    {user.TeacherProfile?.acceptedTerms ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <Clock className="h-8 w-8 text-yellow-600" />
                    )}
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">
                        {user.TeacherProfile?.acceptedTerms ? "Active" : "Pending"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {editMode ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Enter user name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STUDENT">Student</SelectItem>
                          <SelectItem value="TEACHER">Teacher</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</Label>
                        <p className="text-slate-900 dark:text-white font-medium">{displayName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</Label>
                        <p className="text-slate-900 dark:text-white font-medium">{user.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Role</Label>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Joined</Label>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                {(user.StudentProfile || user.TeacherProfile) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {user.StudentProfile && (
                        <>
                          <div>
                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone Number</Label>
                            <p className="text-slate-900 dark:text-white font-medium">
                              {user.StudentProfile.phoneNumber || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Address</Label>
                            <p className="text-slate-900 dark:text-white font-medium">
                              {user.StudentProfile.address || "Not provided"}
                            </p>
                          </div>
                          {user.StudentProfile.guardianName && (
                            <>
                              <div>
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Guardian Name</Label>
                                <p className="text-slate-900 dark:text-white font-medium">
                                  {user.StudentProfile.guardianName}
                                </p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Guardian Contact</Label>
                                <p className="text-slate-900 dark:text-white font-medium">
                                  {user.StudentProfile.guardianContact || "Not provided"}
                                </p>
                              </div>
                            </>
                          )}
                        </>
                      )}
                      {user.TeacherProfile && (
                        <>
                          <div>
                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone Number</Label>
                            <p className="text-slate-900 dark:text-white font-medium">
                              {user.TeacherProfile.phoneNumber || "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Address</Label>
                            <p className="text-slate-900 dark:text-white font-medium">
                              {user.TeacherProfile.address || "Not provided"}
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Role-specific Information */}
            {user.role === "STUDENT" && user.StudentProfile && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date of Birth</Label>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {new Date(user.StudentProfile.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Age</Label>
                        <p className="text-slate-900 dark:text-white font-medium">{user.StudentProfile.age}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Gender</Label>
                        <p className="text-slate-900 dark:text-white font-medium">{user.StudentProfile.gender}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Previous Education</Label>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {user.StudentProfile.previousEducation || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {user.enrollments && user.enrollments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Enrolled Programs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {user.enrollments.map((enrollment, index) => (
                          <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {enrollment.program.name}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {enrollment.program.level.name} • {enrollment.program.track.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {user.role === "TEACHER" && user.TeacherProfile && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Professional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Highest Degree</Label>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {user.TeacherProfile.highestDegree || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Experience</Label>
                        <p className="text-slate-900 dark:text-white font-medium">
                          {user.TeacherProfile.experienceYears ? `${user.TeacherProfile.experienceYears} years` : "Not provided"}
                        </p>
                      </div>
                    </div>
                    {user.TeacherProfile.certifications.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Certifications</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {user.TeacherProfile.certifications.map((cert, index) => (
                            <Badge key={index} variant="outline">{cert}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {user.TeacherProfile.languages.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Languages</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {user.TeacherProfile.languages.map((lang, index) => (
                            <Badge key={index} variant="outline">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {user.TeacherProfile.techSkills.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Technical Skills</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {user.TeacherProfile.techSkills.map((skill, index) => (
                            <Badge key={index} variant="outline">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {user.TeacherProfile.bio && (
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Bio</Label>
                        <p className="text-slate-900 dark:text-white font-medium mt-1">
                          {user.TeacherProfile.bio}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {user.TeacherProfile.paymentInfo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Payment Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Bank Name</Label>
                          <p className="text-slate-900 dark:text-white font-medium">
                            {user.TeacherProfile.paymentInfo.bankName}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Name</Label>
                          <p className="text-slate-900 dark:text-white font-medium">
                            {user.TeacherProfile.paymentInfo.accountName}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Number</Label>
                          <p className="text-slate-900 dark:text-white font-medium">
                            {user.TeacherProfile.paymentInfo.accountNumber}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {user.role === "STUDENT" && (
              <div className="grid grid-cols-1 gap-6">
                {user.attempts && user.attempts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Exam Attempts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {user.attempts.map((attempt, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {attempt.exam.title}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "In Progress"}
                              </p>
                            </div>
                            <div className="text-right">
                              {attempt.score !== null && (
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {attempt.score}%
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {user.role === "TEACHER" && (
              <div className="grid grid-cols-1 gap-6">
                {user.exams && user.exams.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Created Exams
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {user.exams.map((exam, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {exam.title}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                Created on {new Date(exam.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {exam._count.attempts} attempts
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Account settings and preferences will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  Security settings and password management will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Delete User
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {displayName}? This action cannot be undone and will permanently remove all user data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}