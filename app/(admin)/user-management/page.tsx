"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Users, Search, Plus, MoreHorizontal, Edit, Trash2, UserCheck, Mail, Phone, Calendar,
  Shield, GraduationCap, BookOpen, Loader2, Eye, Download, Filter, RefreshCw, Ban,
  CheckCircle, XCircle, AlertCircle, Send, BarChart3, Settings, UserPlus, FileText,
  TrendingUp, Activity, Clock, MapPin, Star
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  createdAt: string;
  updatedAt?: string;
  image?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  lastLogin?: string;
  StudentProfile?: {
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
  };
  TeacherProfile?: {
    fullName: string;
    phoneNumber: string;
    acceptedTerms: boolean;
  };
  enrollments?: { program: { name: string } }[];
  _count?: {
    attempts: number;
    exams: number;
  };
}

interface UserStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    growthRate: number;
    inactiveUsers: number;
  };
  demographics: {
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

export default function UserManagementPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "STUDENT", status: "ACTIVE" });
  const [addForm, setAddForm] = useState({ name: "", email: "", role: "STUDENT", password: "" });
  const [bulkAction, setBulkAction] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      redirect("/access-denied");
    }
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/users/stats")
      ]);
      
      if (usersRes.ok) {
        const userData = await usersRes.json();
        setUsers(userData.users);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.StudentProfile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.TeacherProfile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "ALL") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(user => (user.status || "ACTIVE") === statusFilter);
    }

    if (dateFilter !== "ALL") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case "TODAY":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(user => new Date(user.createdAt) >= filterDate);
          break;
        case "WEEK":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(user => new Date(user.createdAt) >= filterDate);
          break;
        case "MONTH":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(user => new Date(user.createdAt) >= filterDate);
          break;
      }
    }

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof User];
      let bValue: any = b[sortBy as keyof User];
      
      if (sortBy === "name") {
        aValue = a.StudentProfile?.fullName || a.TeacherProfile?.fullName || a.name || "";
        bValue = b.StudentProfile?.fullName || b.TeacherProfile?.fullName || b.name || "";
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, dateFilter, sortBy, sortOrder]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getStatusBadge = (status: string = "ACTIVE") => {
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
    return <Icon className="h-4 w-4" />;
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: bulkAction, userIds: selectedUsers }),
      });
      
      if (response.ok) {
        toast.success(`Bulk ${bulkAction.toLowerCase()} completed successfully`);
        fetchData();
        setSelectedUsers([]);
        setShowBulkDialog(false);
      } else {
        toast.error(`Failed to perform bulk ${bulkAction.toLowerCase()}`);
      }
    } catch (error) {
      toast.error("Error performing bulk action");
    } finally {
      setActionLoading(false);
    }
  };

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Email,Role,Status,Created At,Phone,Programs\n" +
      filteredUsers.map(user => {
        const name = user.StudentProfile?.fullName || user.TeacherProfile?.fullName || user.name || "";
        const phone = user.StudentProfile?.phoneNumber || user.TeacherProfile?.phoneNumber || "";
        const programs = user.enrollments?.map(e => e.program.name).join("; ") || "";
        return `"${name}","${user.email}","${user.role}","${user.status || "ACTIVE"}","${new Date(user.createdAt).toLocaleDateString()}","${phone}","${programs}"`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              User Management
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Comprehensive user management with advanced analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportUsers} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={fetchData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {stats.overview.totalUsers}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Users</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {stats.overview.activeUsers}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">New This Month</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {stats.overview.newUsersThisMonth}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Growth Rate</p>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                      {stats.overview.growthRate > 0 ? '+' : ''}{stats.overview.growthRate}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Inactive</p>
                    <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                      {stats.overview.inactiveUsers}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Table */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-slate-800/50">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users by name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-slate-800"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="STUDENT">Students</SelectItem>
                    <SelectItem value="TEACHER">Teachers</SelectItem>
                    <SelectItem value="ADMIN">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="overflow-x-auto mt-6">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Activity</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center border-2 border-blue-200 dark:border-blue-700">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {user.StudentProfile?.fullName || user.TeacherProfile?.fullName || user.name || "No Name"}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="gap-1">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {(user.StudentProfile?.phoneNumber || user.TeacherProfile?.phoneNumber) && (
                            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                              <Phone className="h-3 w-3" />
                              {user.StudentProfile?.phoneNumber || user.TeacherProfile?.phoneNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          {user.role === "STUDENT" && (
                            <>
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <FileText className="h-3 w-3" />
                                {user._count?.attempts || 0} exams
                              </div>
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <BookOpen className="h-3 w-3" />
                                {user.enrollments?.length || 0} programs
                              </div>
                            </>
                          )}
                          {user.role === "TEACHER" && (
                            <>
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <FileText className="h-3 w-3" />
                                {user._count?.exams || 0} exams created
                              </div>
                              <div className="flex items-center gap-1">
                                {user.TeacherProfile?.acceptedTerms ? (
                                  <Badge variant="success" className="text-xs">Verified</Badge>
                                ) : (
                                  <Badge variant="warning" className="text-xs">Pending</Badge>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} user.TeacherProfile?.phoneNumber || "";
        const programs = user.enrollments?.map(e => e.program.name).join("; ") || "";
        return `"${name}","${user.email}","${user.role}","${user.status || "ACTIVE"}","${new Date(user.createdAt).toLocaleDateString()}","${phone}","${programs}"`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              User Management
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Comprehensive user management with advanced analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportUsers} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={fetchData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Users</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {stats.overview.totalUsers}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Users</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {stats.overview.activeUsers}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">New This Month</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {stats.overview.newUsersThisMonth}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Growth Rate</p>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                      {stats.overview.growthRate > 0 ? '+' : ''}{stats.overview.growthRate}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-red-200 dark:border-red-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Inactive</p>
                    <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                      {stats.overview.inactiveUsers}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Advanced Filters */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users by name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Roles</SelectItem>
                      <SelectItem value="STUDENT">Students</SelectItem>
                      <SelectItem value="TEACHER">Teachers</SelectItem>
                      <SelectItem value="ADMIN">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </div>
              </div>
              
              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Time</SelectItem>
                        <SelectItem value="TODAY">Today</SelectItem>
                        <SelectItem value="WEEK">This Week</SelectItem>
                        <SelectItem value="MONTH">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="role">Role</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {selectedUsers.length} user(s) selected
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setBulkAction("ACTIVATE"); setShowBulkDialog(true); }}>
                      <UserCheck className="h-4 w-4 mr-1" />
                      Activate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setBulkAction("SUSPEND"); setShowBulkDialog(true); }}>
                      <Ban className="h-4 w-4 mr-1" />
                      Suspend
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setBulkAction("DELETE"); setShowBulkDialog(true); }} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 dark:bg-slate-800/50">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Users ({filteredUsers.length})
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage} of {totalPages}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <Checkbox
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers(paginatedUsers.map(user => user.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                      User {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Activity</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center border-2 border-blue-200 dark:border-blue-700">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {user.StudentProfile?.fullName || user.TeacherProfile?.fullName || user.name || "No Name"}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="gap-1">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {(user.StudentProfile?.phoneNumber || user.TeacherProfile?.phoneNumber) && (
                            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                              <Phone className="h-3 w-3" />
                              {user.StudentProfile?.phoneNumber || user.TeacherProfile?.phoneNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          {user.role === "STUDENT" && (
                            <>
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <FileText className="h-3 w-3" />
                                {user._count?.attempts || 0} exams
                              </div>
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <BookOpen className="h-3 w-3" />
                                {user.enrollments?.length || 0} programs
                              </div>
                            </>
                          )}
                          {user.role === "TEACHER" && (
                            <>
                              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <FileText className="h-3 w-3" />
                                {user._count?.exams || 0} exams created
                              </div>
                              <div className="flex items-center gap-1">
                                {user.TeacherProfile?.acceptedTerms ? (
                                  <Badge variant="success" className="text-xs">Verified</Badge>
                                ) : (
                                  <Badge variant="warning" className="text-xs">Pending</Badge>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setEditForm({
                                name: user.name || "",
                                email: user.email,
                                role: user.role,
                                status: user.status || "ACTIVE",
                              });
                              setShowEditDialog(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteDialog(true);
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t bg-slate-50/50 dark:bg-slate-800/50">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information and settings.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Role</Label>
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
                  <Label htmlFor="edit-status">Status</Label>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!selectedUser) return;
                setActionLoading(true);
                try {
                  const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editForm),
                  });
                  if (response.ok) {
                    toast.success("User updated successfully");
                    fetchData();
                    setShowEditDialog(false);
                  } else {
                    toast.error("Failed to update user");
                  }
                } catch (error) {
                  toast.error("Error updating user");
                } finally {
                  setActionLoading(false);
                }
              }} disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.name || selectedUser?.email}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                if (!selectedUser) return;
                setActionLoading(true);
                try {
                  const response = await fetch(`/api/admin/users/${selectedUser.id}`, { method: "DELETE" });
                  if (response.ok) {
                    toast.success("User deleted successfully");
                    fetchData();
                    setShowDeleteDialog(false);
                  } else {
                    toast.error("Failed to delete user");
                  }
                } catch (error) {
                  toast.error("Error deleting user");
                } finally {
                  setActionLoading(false);
                }
              }} disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="add-name">Name</Label>
                <Input
                  id="add-name"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <Label htmlFor="add-email">Email</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="add-password">Password</Label>
                <Input
                  id="add-password"
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="add-role">Role</Label>
                <Select value={addForm.role} onValueChange={(value) => setAddForm({ ...addForm, role: value })}>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                setActionLoading(true);
                try {
                  const response = await fetch("/api/admin/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(addForm),
                  });
                  if (response.ok) {
                    toast.success("User created successfully");
                    fetchData();
                    setShowAddDialog(false);
                    setAddForm({ name: "", email: "", role: "STUDENT", password: "" });
                  } else {
                    const data = await response.json();
                    toast.error(data.error || "Failed to create user");
                  }
                } catch (error) {
                  toast.error("Error creating user");
                } finally {
                  setActionLoading(false);
                }
              }} disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk {bulkAction}</DialogTitle>
              <DialogDescription>
                Are you sure you want to {bulkAction.toLowerCase()} {selectedUsers.length} selected user(s)? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkDialog(false)}>Cancel</Button>
              <Button 
                variant={bulkAction === "DELETE" ? "destructive" : "default"} 
                onClick={handleBulkAction} 
                disabled={actionLoading}
              >
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {bulkAction === "DELETE" ? "Delete" : bulkAction === "ACTIVATE" ? "Activate" : "Suspend"} Users
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}