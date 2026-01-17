"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  BookOpen,
  Shield,
  Edit,
  Save,
  X,
  Clock,
  Activity,
  Award,
  Users,
  FileText,
  Settings,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface UserProfileProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  image?: string;
  createdAt: string;
  lastLogin?: string;
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
    experienceYears?: number;
    bio?: string;
    equipment?: string;
    acceptedTerms: boolean;
    certifications: string[];
    languages: string[];
    techSkills: string[];
  };
  enrollments?: Array<{
    program: {
      name: string;
      level: { name: string };
      track: { name: string };
    };
  }>;
  attempts?: Array<{
    exam: {
      title: string;
      createdAt: string;
    };
    score?: number;
    submittedAt?: string;
  }>;
  exams?: Array<{
    title: string;
    createdAt: string;
    _count: {
      attempts: number;
    };
  }>;
  _count?: {
    attempts: number;
    exams: number;
    enrollments: number;
  };
}

export default function UserProfileDialog({ userId, isOpen, onClose, onUpdate }: UserProfileProps) {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setEditForm({
          name: data.user.name || "",
          email: data.user.email,
          role: data.user.role,
          status: data.user.status,
        });
      } else {
        toast.error("Failed to load user details");
      }
    } catch (error) {
      toast.error("Error loading user details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      
      if (response.ok) {
        toast.success("User updated successfully");
        setEditing(false);
        fetchUserDetails();
        onUpdate?.();
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      toast.error("Error updating user");
    } finally {
      setSaving(false);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-100 text-green-800", label: "Active" },
      INACTIVE: { color: "bg-gray-100 text-gray-800", label: "Inactive" },
      SUSPENDED: { color: "bg-red-100 text-red-800", label: "Suspended" },
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            View and manage user information and activity
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Header Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="text-lg">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {user.StudentProfile?.fullName || user.TeacherProfile?.fullName || user.name || "No Name"}
                      </h3>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-sm">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                        {getStatusBadge(user.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <Button size="sm" onClick={handleSave} disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => setEditing(true)}>
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="programs">Programs</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editing ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
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
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                              <SelectItem value="SUSPENDED">Suspended</SelectItem>
                              <SelectItem value="PENDING">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        {(user.StudentProfile?.phoneNumber || user.TeacherProfile?.phoneNumber) && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{user.StudentProfile?.phoneNumber || user.TeacherProfile?.phoneNumber}</span>
                          </div>
                        )}
                        {user.lastLogin && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Role-specific Profile Information */}
                {user.StudentProfile && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Student Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Date of Birth</Label>
                          <p>{new Date(user.StudentProfile.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Age</Label>
                          <p>{user.StudentProfile.age}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Gender</Label>
                          <p>{user.StudentProfile.gender}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Address</Label>
                          <p>{user.StudentProfile.address}</p>
                        </div>
                        {user.StudentProfile.guardianName && (
                          <>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Guardian Name</Label>
                              <p>{user.StudentProfile.guardianName}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Guardian Contact</Label>
                              <p>{user.StudentProfile.guardianContact}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {user.TeacherProfile && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Teacher Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Highest Degree</Label>
                          <p>{user.TeacherProfile.highestDegree || "Not specified"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Experience Years</Label>
                          <p>{user.TeacherProfile.experienceYears || 0} years</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Terms Accepted</Label>
                          <p>{user.TeacherProfile.acceptedTerms ? "Yes" : "No"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Address</Label>
                          <p>{user.TeacherProfile.address || "Not provided"}</p>
                        </div>
                      </div>
                      {user.TeacherProfile.bio && (
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Bio</Label>
                          <p className="text-sm">{user.TeacherProfile.bio}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Activity className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Total Activity</p>
                          <p className="text-2xl font-bold">
                            {(user._count?.attempts || 0) + (user._count?.exams || 0)}
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
                              <p className="text-sm text-gray-600">Exams Taken</p>
                              <p className="text-2xl font-bold">{user._count?.attempts || 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <BookOpen className="h-8 w-8 text-purple-600" />
                            <div>
                              <p className="text-sm text-gray-600">Programs</p>
                              <p className="text-2xl font-bold">{user._count?.enrollments || 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                  
                  {user.role === "TEACHER" && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Award className="h-8 w-8 text-orange-600" />
                          <div>
                            <p className="text-sm text-gray-600">Exams Created</p>
                            <p className="text-2xl font-bold">{user._count?.exams || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Recent Activity */}
                {user.role === "STUDENT" && user.attempts && user.attempts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Exam Attempts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {user.attempts.slice(0, 5).map((attempt, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{attempt.exam.title}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(attempt.exam.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              {attempt.score !== null && (
                                <p className="font-medium">{attempt.score}%</p>
                              )}
                              {attempt.submittedAt && (
                                <p className="text-sm text-gray-600">
                                  Submitted: {new Date(attempt.submittedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {user.role === "TEACHER" && user.exams && user.exams.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Exams Created</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {user.exams.slice(0, 5).map((exam, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{exam.title}</p>
                              <p className="text-sm text-gray-600">
                                Created: {new Date(exam.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{exam._count.attempts} attempts</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="programs" className="space-y-4">
                {user.enrollments && user.enrollments.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Enrolled Programs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {user.enrollments.map((enrollment, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <h4 className="font-medium">{enrollment.program.name}</h4>
                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                              <span>Level: {enrollment.program.level.name}</span>
                              <span>Track: {enrollment.program.track.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No program enrollments found</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                        <p>{getStatusBadge(user.status)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Role</Label>
                        <p className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Account Created</Label>
                        <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                        <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">User not found</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}