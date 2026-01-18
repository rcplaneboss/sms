"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, User, Mail, Lock, Shield, GraduationCap, BookOpen,
  Phone, MapPin, Calendar, Users, CheckCircle, Loader2
} from "lucide-react";
import { toast } from "sonner";

interface UserForm {
  // Basic Info
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  
  // Profile Info
  fullName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  
  // Student Specific
  guardianName?: string;
  guardianContact?: string;
  previousEducation?: string;
  
  // Teacher Specific
  highestDegree?: string;
  experienceYears?: number;
  bio?: string;
  equipment?: string;
}

export default function NewUserPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    fullName: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    age: "",
    gender: "Not specified",
    guardianName: "",
    guardianContact: "",
    previousEducation: "",
    highestDegree: "",
    experienceYears: 0,
    bio: "",
    equipment: ""
  });

  if (session?.user?.role !== "ADMIN") {
    redirect("/access-denied");
  }

  const updateForm = (field: keyof UserForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return form.name && form.email && form.password && form.role;
      case 2:
        return form.fullName && form.phoneNumber;
      case 3:
        return true; // Optional fields
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.role === "STUDENT" && {
          studentProfile: {
            fullName: form.fullName,
            phoneNumber: form.phoneNumber,
            dateOfBirth: form.dateOfBirth || new Date().toISOString(),
            age: form.age || "0",
            gender: form.gender,
            address: form.address,
            guardianName: form.guardianName,
            guardianContact: form.guardianContact,
            previousEducation: form.previousEducation
          }
        }),
        ...(form.role === "TEACHER" && {
          teacherProfile: {
            fullName: form.fullName,
            phoneNumber: form.phoneNumber,
            address: form.address,
            highestDegree: form.highestDegree,
            experienceYears: form.experienceYears || 0,
            bio: form.bio,
            equipment: form.equipment
          }
        })
      };

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const getRoleIcon = (role: string) => {
    const icons = {
      ADMIN: Shield,
      TEACHER: GraduationCap,
      STUDENT: BookOpen
    };
    const Icon = icons[role as keyof typeof icons] || Users;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create New User</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Add a new user to the system with complete profile information
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step 
                  ? "bg-blue-600 border-blue-600 text-white" 
                  : "border-slate-300 text-slate-400"
              }`}>
                {currentStep > step ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{step}</span>
                )}
              </div>
              <div className="ml-3 text-sm">
                <p className={`font-medium ${currentStep >= step ? "text-blue-600" : "text-slate-400"}`}>
                  {step === 1 && "Basic Info"}
                  {step === 2 && "Profile Details"}
                  {step === 3 && "Additional Info"}
                </p>
              </div>
              {step < 3 && (
                <div className={`w-16 h-0.5 ml-8 ${
                  currentStep > step ? "bg-blue-600" : "bg-slate-300"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Profile Details"}
              {currentStep === 3 && "Additional Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      placeholder="Enter display name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      placeholder="Enter email address"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={(e) => updateForm("password", e.target.value)}
                      placeholder="Enter password"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">User Role</Label>
                    <Select value={form.role} onValueChange={(value) => updateForm("role", value)}>
                      <SelectTrigger className="mt-1">
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

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    {getRoleIcon(form.role)}
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {form.role} Account
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {form.role === "STUDENT" && "Students can enroll in programs, take exams, and view their results."}
                    {form.role === "TEACHER" && "Teachers can create exams, grade submissions, and manage their courses."}
                    {form.role === "ADMIN" && "Admins have full access to manage users, programs, and system settings."}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Profile Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => updateForm("fullName", e.target.value)}
                      placeholder="Enter full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={form.phoneNumber}
                      onChange={(e) => updateForm("phoneNumber", e.target.value)}
                      placeholder="Enter phone number"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => updateForm("address", e.target.value)}
                    placeholder="Enter address"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => updateForm("dateOfBirth", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={form.age}
                      onChange={(e) => updateForm("age", e.target.value)}
                      placeholder="Enter age"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={form.gender} onValueChange={(value) => updateForm("gender", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Not specified">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Additional Info */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {form.role === "STUDENT" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="guardianName">Guardian Name (Optional)</Label>
                        <Input
                          id="guardianName"
                          value={form.guardianName}
                          onChange={(e) => updateForm("guardianName", e.target.value)}
                          placeholder="Enter guardian name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="guardianContact">Guardian Contact (Optional)</Label>
                        <Input
                          id="guardianContact"
                          value={form.guardianContact}
                          onChange={(e) => updateForm("guardianContact", e.target.value)}
                          placeholder="Enter guardian contact"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="previousEducation">Previous Education (Optional)</Label>
                      <Input
                        id="previousEducation"
                        value={form.previousEducation}
                        onChange={(e) => updateForm("previousEducation", e.target.value)}
                        placeholder="Enter previous education details"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                {form.role === "TEACHER" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="highestDegree">Highest Degree</Label>
                        <Input
                          id="highestDegree"
                          value={form.highestDegree}
                          onChange={(e) => updateForm("highestDegree", e.target.value)}
                          placeholder="Enter highest degree"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="experienceYears">Years of Experience</Label>
                        <Input
                          id="experienceYears"
                          type="number"
                          value={form.experienceYears}
                          onChange={(e) => updateForm("experienceYears", parseInt(e.target.value) || 0)}
                          placeholder="Enter years of experience"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio (Optional)</Label>
                      <Input
                        id="bio"
                        value={form.bio}
                        onChange={(e) => updateForm("bio", e.target.value)}
                        placeholder="Enter bio"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="equipment">Equipment (Optional)</Label>
                      <Input
                        id="equipment"
                        value={form.equipment}
                        onChange={(e) => updateForm("equipment", e.target.value)}
                        placeholder="Enter equipment details"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                {form.role === "ADMIN" && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-amber-900 dark:text-amber-100">
                        Admin Account
                      </span>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      This user will have full administrative privileges. Please ensure this is intended.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentStep < 3 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="gap-2"
                  >
                    Next
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !validateStep(currentStep)}
                    className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create User
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}