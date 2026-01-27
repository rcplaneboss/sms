"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Phone, 
  GraduationCap, 
  BookOpen, 
  Settings, 
  Edit3, 
  Save, 
  X,
  TrendingUp,
  Clock,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";

interface StudentProfile {
  id: string;
  fullName: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  phoneNumber: string;
  address: string;
  guardianName?: string;
  guardianContact?: string;
  previousEducation?: string;
  user: {
    name: string;
    email: string;
  };
  enrollments: Array<{
    status: string;
    program: {
      name: string;
      level: { name: string };
      track: { name: string };
    };
  }>;
}

export default function StudentProfilePage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    guardianName: "",
    guardianContact: "",
    previousEducation: "",
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/student/profile`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditForm({
          fullName: data.fullName || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          guardianName: data.guardianName || "",
          guardianContact: data.guardianContact || "",
          previousEducation: data.previousEducation || "",
        });
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/student/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
        setEditing(false);
        fetchProfile();
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Profile Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Please complete your student registration first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <User className="h-8 w-8 text-blue-600" />
              My Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage your personal information and academic details
            </p>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button onClick={() => setEditing(false)} variant="outline" className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)} className="gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="academic">Academic Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Full Name</Label>
                    {editing ? (
                      <Input
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white font-medium">
                        {profile.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-slate-600 dark:text-slate-400">
                      {profile.user.email}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date of Birth</Label>
                      <p className="text-slate-900 dark:text-white">
                        {new Date(profile.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label>Age</Label>
                      <p className="text-slate-900 dark:text-white">
                        {profile.age} years
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <p className="text-slate-900 dark:text-white">
                      {profile.gender}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Phone Number</Label>
                    {editing ? (
                      <Input
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">
                        {profile.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Address</Label>
                    {editing ? (
                      <Input
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">
                        {profile.address}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Guardian Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Guardian Name</Label>
                    {editing ? (
                      <Input
                        value={editForm.guardianName}
                        onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">
                        {profile.guardianName || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Guardian Contact</Label>
                    {editing ? (
                      <Input
                        value={editForm.guardianContact}
                        onChange={(e) => setEditForm({ ...editForm, guardianContact: e.target.value })}
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">
                        {profile.guardianContact || "Not provided"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                    Educational Background
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label>Previous Education</Label>
                    {editing ? (
                      <Input
                        value={editForm.previousEducation}
                        onChange={(e) => setEditForm({ ...editForm, previousEducation: e.target.value })}
                        placeholder="e.g., Primary School Certificate"
                      />
                    ) : (
                      <p className="text-slate-900 dark:text-white">
                        {profile.previousEducation || "Not provided"}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Current Enrollment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {profile.enrollments.map((enrollment, index) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {enrollment.program.name}
                          </h3>
                          <Badge variant={enrollment.status === "Active" ? "default" : "secondary"}>
                            {enrollment.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">Level:</span>
                            <span className="ml-2 text-slate-900 dark:text-white">
                              {enrollment.program.level.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">Track:</span>
                            <span className="ml-2 text-slate-900 dark:text-white">
                              {enrollment.program.track.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    No active enrollments found.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-600" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Notification Preferences
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}