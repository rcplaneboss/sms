"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Mail, Phone, Calendar, MapPin, GraduationCap, BookOpen, 
  FileText, Activity, Clock, Edit, Trash2, Ban, CheckCircle, 
  XCircle, AlertCircle, Shield, Users, Star, TrendingUp, Award
} from "lucide-react";
import { toast } from "sonner";

interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  status: string;
  lastLogin: string;
  StudentProfile?: {
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
    age: string;
    gender: string;
    address: string;
    guardianName?: string;
    guardianContact?: string;
  };
  TeacherProfile?: {
    fullName: string;
    phoneNumber: string;
    address: string;
    highestDegree: string;
    experienceYears: number;
    bio: string;
    acceptedTerms: boolean;
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
    startedAt: string;
  }>;
  exams?: Array<{
    title: string;
    createdAt: string;
    _count: {
      attempts: number;
    };
  }>;
  _count: {
    attempts: number;
    exams: number;
    enrollments: number;
  };
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      redirect("/access-denied");
    }
    fetchUserDetails();
  }, [session, params.id]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        toast.error("Failed to load user details");
        router.push("/user-management");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Error loading user details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: { variant: "success" as const, icon: CheckCircle, text: "Active" },
      INACTIVE: { variant: "secondary" as const, icon: XCircle, text: "Inactive" },
      SUSPENDED: { variant: "destructive" as const, icon: Ban, text: "Suspended" },
      PENDING: { variant: "warning" as const, icon: AlertCircle, text: "Pending" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.ACTIVE;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      ADMIN: Shield,
      TEACHER: GraduationCap,
      STUDENT: BookOpen
    };
    const Icon = icons[role as keyof typeof icons] || Users;
    return <Icon className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User not found</h2>
          <Button onClick={() => router.push("/user-management")} className="mt-4">
            Back to User Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/user-management")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Details</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Comprehensive user information and activity
            </p>
          </div>
        </div>

        {/* User Profile Card */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center border-4 border-blue-200 dark:border-blue-700">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-2xl">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {user.StudentProfile?.fullName || user.TeacherProfile?.fullName || user.name || "No Name"}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(user.status)}
                    <Badge variant="outline" className="gap-1">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    Last active {new Date(user.lastLogin).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Activity className="h-4 w-4" />
                    {user._count.attempts + user._count.exams} total activities
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.role === "STUDENT" && user.StudentProfile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                      <p className="text-slate-900 dark:text-white">{user.StudentProfile.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                      <p className="text-slate-900 dark:text-white flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {user.StudentProfile.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                      <p className="text-slate-900 dark:text-white">
                        {new Date(user.StudentProfile.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Age</label>
                      <p className="text-slate-900 dark:text-white">{user.StudentProfile.age} years</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                      <p className="text-slate-900 dark:text-white">{user.StudentProfile.gender}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                      <p className="text-slate-900 dark:text-white flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.StudentProfile.address}
                      </p>
                    </div>
                    {user.StudentProfile.guardianName && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Guardian Name</label>
                          <p className="text-slate-900 dark:text-white">{user.StudentProfile.guardianName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Guardian Contact</label>
                          <p className="text-slate-900 dark:text-white">{user.StudentProfile.guardianContact}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {user.role === "TEACHER" && user.TeacherProfile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                      <p className="text-slate-900 dark:text-white">{user.TeacherProfile.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                      <p className="text-slate-900 dark:text-white flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {user.TeacherProfile.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                      <p className="text-slate-900 dark:text-white flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.TeacherProfile.address}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Highest Degree</label>
                      <p className="text-slate-900 dark:text-white flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {user.TeacherProfile.highestDegree}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Experience</label>
                      <p className="text-slate-900 dark:text-white">{user.TeacherProfile.experienceYears} years</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Terms Accepted</label>
                      <p className="text-slate-900 dark:text-white">
                        {user.TeacherProfile.acceptedTerms ? (
                          <Badge variant="success">Yes</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </p>
                    </div>
                    {user.TeacherProfile.bio && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                        <p className="text-slate-900 dark:text-white">{user.TeacherProfile.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity History */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.role === "STUDENT" && user.attempts && user.attempts.length > 0 ? (
                    user.attempts.map((attempt, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{attempt.exam.title}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Attempted on {new Date(attempt.startedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {attempt.score && (
                          <Badge variant={attempt.score >= 70 ? "success" : "warning"}>
                            {attempt.score}%
                          </Badge>
                        )}
                      </div>
                    ))
                  ) : user.role === "TEACHER" && user.exams && user.exams.length > 0 ? (
                    user.exams.map((exam, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{exam.title}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Created on {new Date(exam.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {exam._count.attempts} attempts
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400 text-center py-8">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics & Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {user.role === "STUDENT" ? "Exam Attempts" : "Exams Created"}
                      </span>
                      <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {user.role === "STUDENT" ? user._count.attempts : user._count.exams}
                      </span>
                    </div>
                  </div>
                  
                  {user.role === "STUDENT" && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Programs Enrolled</span>
                        <span className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {user._count.enrollments}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Account Age</span>
                      <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-slate-600" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full gap-2" variant="outline">
                  <Edit className="h-4 w-4" />
                  Edit User
                </Button>
                <Button className="w-full gap-2" variant="outline">
                  <Mail className="h-4 w-4" />
                  Send Message
                </Button>
                <Button className="w-full gap-2" variant="outline">
                  <FileText className="h-4 w-4" />
                  Generate Report
                </Button>
                <Button className="w-full gap-2" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete User
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}