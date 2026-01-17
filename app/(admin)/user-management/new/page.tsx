"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  GraduationCap,
  BookOpen,
  Loader2,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface UserForm {
  // Basic Info
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  
  // Student Profile
  studentProfile?: {
    fullName: string;
    dateOfBirth: string;
    age: string;
    gender: string;
    phoneNumber: string;
    address: string;
    guardianName?: string;
    guardianContact?: string;
    previousEducation?: string;
  };
  
  // Teacher Profile
  teacherProfile?: {
    fullName: string;
    phoneNumber: string;
    address?: string;
    highestDegree?: string;
    experienceYears?: number;
    bio?: string;
    equipment?: string;
  };
}

export default function NewUserPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const handleRoleChange = (role: "STUDENT" | "TEACHER" | "ADMIN") => {
    setForm(prev => ({
      ...prev,
      role,
      studentProfile: role === "STUDENT" ? {
        fullName: "",
        dateOfBirth: "",
        age: "",
        gender: "",
        phoneNumber: "",
        address: "",
        guardianName: "",
        guardianContact: "",
        previousEducation: "",
      } : undefined,
      teacherProfile: role === "TEACHER" ? {
        fullName: "",
        phoneNumber: "",
        address: "",
        highestDegree: "",
        experienceYears: 0,
        bio: "",
        equipment: "",
      } : undefined,
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (form.role === "STUDENT" && form.studentProfile) {
      if (!form.studentProfile.fullName || !form.studentProfile.phoneNumber) {
        toast.error("Please fill in student profile information");
        return;
      }
    }

    if (form.role === "TEACHER" && form.teacherProfile) {
      if (!form.teacherProfile.fullName || !form.teacherProfile.phoneNumber) {
        toast.error("Please fill in teacher profile information");
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        toast.success("User created successfully");
        router.push("/user-management");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create user");
      }
    } catch (error) {
      toast.error("Error creating user");
    } finally {
      setLoading(false);
    }
  };

  if (session?.user?.role !== "ADMIN") {
    router.push("/access-denied");
    return null;
  }

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/user-management")}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              Add New User
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Create a new user account with profile information
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="profile" disabled={form.role === "ADMIN"}>
                  Profile Details
                </TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Select value={form.role} onValueChange={handleRoleChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Student
                          </div>
                        </SelectItem>
                        <SelectItem value="TEACHER">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Teacher
                          </div>
                        </SelectItem>
                        <SelectItem value="ADMIN">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setActiveTab("profile")} 
                    disabled={form.role === "ADMIN"}
                  >
                    Next: Profile Details
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                {form.role === "STUDENT" && form.studentProfile && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">Student Profile</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="student-fullName">Full Name *</Label>
                        <Input
                          id="student-fullName"
                          value={form.studentProfile.fullName}
                          onChange={(e) => setForm({
                            ...form,
                            studentProfile: { ...form.studentProfile!, fullName: e.target.value }
                          })}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="student-phone">Phone Number *</Label>
                        <Input
                          id="student-phone"
                          value={form.studentProfile.phoneNumber}
                          onChange={(e) => setForm({
                            ...form,
                            studentProfile: { ...form.studentProfile!, phoneNumber: e.target.value }
                          })}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="student-dob">Date of Birth</Label>
                        <Input
                          id="student-dob"
                          type="date"
                          value={form.studentProfile.dateOfBirth}
                          onChange={(e) => setForm({
                            ...form,
                            studentProfile: { ...form.studentProfile!, dateOfBirth: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="student-age">Age</Label>
                        <Input
                          id="student-age"
                          value={form.studentProfile.age}
                          onChange={(e) => setForm({
                            ...form,
                            studentProfile: { ...form.studentProfile!, age: e.target.value }
                          })}
                          placeholder="Enter age"
                        />
                      </div>
                      <div>
                        <Label htmlFor="student-gender">Gender</Label>
                        <Select 
                          value={form.studentProfile.gender} 
                          onValueChange={(value) => setForm({
                            ...form,
                            studentProfile: { ...form.studentProfile!, gender: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="student-guardian">Guardian Name</Label>
                        <Input
                          id="student-guardian"
                          value={form.studentProfile.guardianName}
                          onChange={(e) => setForm({
                            ...form,
                            studentProfile: { ...form.studentProfile!, guardianName: e.target.value }
                          })}
                          placeholder="Enter guardian name"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="student-address">Address</Label>
                        <Textarea
                          id="student-address"
                          value={form.studentProfile.address}
                          onChange={(e) => setForm({
                            ...form,
                            studentProfile: { ...form.studentProfile!, address: e.target.value }
                          })}
                          placeholder="Enter address"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="student-guardian-contact">Guardian Contact</Label>
                        <Input
                          id="student-guardian-contact"
                          value={form.studentProfile.guardianContact}
                          onChange={(e) => setForm({
                            ...form,
                            studentProfile: { ...form.studentProfile!, guardianContact: e.target.value }
                          })}
                          placeholder="Enter guardian contact"
                        />
                      </div>
                      <div>
                        <Label htmlFor="student-education">Previous Education</Label>
                        <Input
                          id="student-education"
                          value={form.studentProfile.previousEducation}
                          onChange={(e) => setForm({
                            ...form,
                            studentProfile: { ...form.studentProfile!, previousEducation: e.target.value }
                          })}
                          placeholder="Enter previous education"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {form.role === "TEACHER" && form.teacherProfile && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Teacher Profile</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="teacher-fullName">Full Name *</Label>
                        <Input
                          id="teacher-fullName"
                          value={form.teacherProfile.fullName}
                          onChange={(e) => setForm({
                            ...form,
                            teacherProfile: { ...form.teacherProfile!, fullName: e.target.value }
                          })}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="teacher-phone">Phone Number *</Label>
                        <Input
                          id="teacher-phone"
                          value={form.teacherProfile.phoneNumber}
                          onChange={(e) => setForm({
                            ...form,
                            teacherProfile: { ...form.teacherProfile!, phoneNumber: e.target.value }
                          })}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="teacher-degree">Highest Degree</Label>
                        <Input
                          id="teacher-degree"
                          value={form.teacherProfile.highestDegree}
                          onChange={(e) => setForm({
                            ...form,
                            teacherProfile: { ...form.teacherProfile!, highestDegree: e.target.value }
                          })}
                          placeholder="Enter highest degree"
                        />
                      </div>
                      <div>
                        <Label htmlFor="teacher-experience">Years of Experience</Label>
                        <Input
                          id="teacher-experience"
                          type="number"
                          value={form.teacherProfile.experienceYears}
                          onChange={(e) => setForm({
                            ...form,
                            teacherProfile: { ...form.teacherProfile!, experienceYears: parseInt(e.target.value) || 0 }
                          })}
                          placeholder="Enter years of experience"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="teacher-address">Address</Label>
                        <Textarea
                          id="teacher-address"
                          value={form.teacherProfile.address}
                          onChange={(e) => setForm({
                            ...form,
                            teacherProfile: { ...form.teacherProfile!, address: e.target.value }
                          })}
                          placeholder="Enter address"
                          rows={3}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="teacher-bio">Bio</Label>
                        <Textarea
                          id="teacher-bio"
                          value={form.teacherProfile.bio}
                          onChange={(e) => setForm({
                            ...form,
                            teacherProfile: { ...form.teacherProfile!, bio: e.target.value }
                          })}
                          placeholder="Enter bio"
                          rows={4}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="teacher-equipment">Equipment</Label>
                        <Textarea
                          id="teacher-equipment"
                          value={form.teacherProfile.equipment}
                          onChange={(e) => setForm({
                            ...form,
                            teacherProfile: { ...form.teacherProfile!, equipment: e.target.value }
                          })}
                          placeholder="Enter equipment details"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("basic")}>
                    Previous: Basic Info
                  </Button>
                  <Button onClick={() => setActiveTab("review")}>
                    Next: Review
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="review" className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <h3 className="text-lg font-semibold">Review Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Name</Label>
                        <p className="text-slate-900 dark:text-white font-medium">{form.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</Label>
                        <p className="text-slate-900 dark:text-white font-medium">{form.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Role</Label>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(form.role)}
                          <span className="text-slate-900 dark:text-white font-medium">{form.role}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {form.role !== "ADMIN" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {form.role === "STUDENT" ? <BookOpen className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
                          Profile Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {form.role === "STUDENT" && form.studentProfile && (
                          <>
                            <div>
                              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</Label>
                              <p className="text-slate-900 dark:text-white font-medium">{form.studentProfile.fullName}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</Label>
                              <p className="text-slate-900 dark:text-white font-medium">{form.studentProfile.phoneNumber}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Gender</Label>
                              <p className="text-slate-900 dark:text-white font-medium">{form.studentProfile.gender || "Not specified"}</p>
                            </div>
                          </>
                        )}
                        {form.role === "TEACHER" && form.teacherProfile && (
                          <>
                            <div>
                              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</Label>
                              <p className="text-slate-900 dark:text-white font-medium">{form.teacherProfile.fullName}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</Label>
                              <p className="text-slate-900 dark:text-white font-medium">{form.teacherProfile.phoneNumber}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Experience</Label>
                              <p className="text-slate-900 dark:text-white font-medium">
                                {form.teacherProfile.experienceYears ? `${form.teacherProfile.experienceYears} years` : "Not specified"}
                              </p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab(form.role === "ADMIN" ? "basic" : "profile")}>
                    Previous
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4" />
                    Create User
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}