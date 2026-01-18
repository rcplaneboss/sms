"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Users, Search, MoreHorizontal, Edit, Trash2, Mail, Phone, Calendar,
  Shield, GraduationCap, BookOpen, Loader2, Eye, Download, RefreshCw,
  UserPlus, FileText, Filter, Ban, UserCheck, CheckCircle, XCircle, AlertCircle,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  createdAt: string;
  StudentProfile?: {
    fullName: string;
    phoneNumber: string;
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

export default function UserManagementPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "STUDENT", status: "ACTIVE" });
  const [bulkAction, setBulkAction] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.StudentProfile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.TeacherProfile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "ALL") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(user => (user.status || "ACTIVE") === statusFilter);
    }

    // Date filter
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

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getRoleIcon = (role: string) => {
    const icons = {
      ADMIN: Shield,
      TEACHER: GraduationCap,
      STUDENT: BookOpen
    };
    const Icon = icons[role as keyof typeof icons] || Users;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string = "ACTIVE") => {
    const variants = {
      ACTIVE: { icon: CheckCircle, text: "Active", className: "bg-green-100 text-green-800" },
      INACTIVE: { icon: XCircle, text: "Inactive", className: "bg-gray-100 text-gray-800" },
      SUSPENDED: { icon: Ban, text: "Suspended", className: "bg-red-100 text-red-800" },
      PENDING: { icon: AlertCircle, text: "Pending", className: "bg-yellow-100 text-yellow-800" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.ACTIVE;
    const Icon = config.icon;
    
    return (
      <Badge className={`gap-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
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
        fetchUsers();
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
      "Name,Email,Role,Status,Created At,Phone\n" +
      filteredUsers.map(user => {
        const name = user.StudentProfile?.fullName || user.TeacherProfile?.fullName || user.name || "";
        const phone = user.StudentProfile?.phoneNumber || user.TeacherProfile?.phoneNumber || "";
        return `"${name}","${user.email}","${user.role}","${user.status || "ACTIVE"}","${new Date(user.createdAt).toLocaleDateString()}","${phone}"`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Users exported successfully");
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email,
      role: user.role,
      status: user.status || "ACTIVE"
    });
    setShowEditDialog(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailsDialog(true);
  };

  const submitEditUser = async () => {
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
        fetchUsers();
        setShowEditDialog(false);
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      toast.error("Error updating user");
    } finally {
      setActionLoading(false);
    }
  };

  const submitDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("User deleted successfully");
        fetchUsers();
        setShowDeleteDialog(false);
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      toast.error("Error deleting user");
    } finally {
      setActionLoading(false);
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              User Management
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Manage all users in the system
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportUsers} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={fetchUsers} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {users.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Students</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {users.filter(u => u.role === "STUDENT").length}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Teachers</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {users.filter(u => u.role === "TEACHER").length}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Admins</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {users.filter(u => u.role === "ADMIN").length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {users.filter(u => (u.status || "ACTIVE") === "ACTIVE").length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users by name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
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
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Created</label>
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
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Per Page</label>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedUsers.length} user(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBulkAction("ACTIVATE");
                        setShowBulkDialog(true);
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Activate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBulkAction("SUSPEND");
                        setShowBulkDialog(true);
                      }}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Suspend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBulkAction("DELETE");
                        setShowBulkDialog(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
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
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">
                      <Checkbox
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {user.StudentProfile?.fullName || user.TeacherProfile?.fullName || user.name || "No Name"}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="gap-1">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-red-600">
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
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
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

        {/* Bulk Action Dialog */}
        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk {bulkAction}</DialogTitle>
              <DialogDescription>
                Are you sure you want to {bulkAction.toLowerCase()} {selectedUsers.length} selected user(s)? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                Cancel
              </Button>
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

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and settings.
              </DialogDescription>
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
              <Button onClick={submitEditUser} disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.StudentProfile?.fullName || selectedUser?.TeacherProfile?.fullName || selectedUser?.name || selectedUser?.email}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={submitDeleteUser} disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Comprehensive information about the selected user.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                {/* User Header */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                      {(selectedUser.name || selectedUser.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {selectedUser.StudentProfile?.fullName || selectedUser.TeacherProfile?.fullName || selectedUser.name || "No Name"}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="gap-1">
                        {getRoleIcon(selectedUser.role)}
                        {selectedUser.role}
                      </Badge>
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{selectedUser.email}</span>
                      </div>
                      {(selectedUser.StudentProfile?.phoneNumber || selectedUser.TeacherProfile?.phoneNumber) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{selectedUser.StudentProfile?.phoneNumber || selectedUser.TeacherProfile?.phoneNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white">Activity Summary</h4>
                    <div className="space-y-2">
                      {selectedUser.role === "STUDENT" && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Exam Attempts:</span>
                            <span className="font-medium">{selectedUser._count?.attempts || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Programs Enrolled:</span>
                            <span className="font-medium">{selectedUser.enrollments?.length || 0}</span>
                          </div>
                        </>
                      )}
                      {selectedUser.role === "TEACHER" && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Exams Created:</span>
                            <span className="font-medium">{selectedUser._count?.exams || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Terms Accepted:</span>
                            <span className="font-medium">
                              {selectedUser.TeacherProfile?.acceptedTerms ? "Yes" : "No"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Programs (for students) */}
                {selectedUser.role === "STUDENT" && selectedUser.enrollments && selectedUser.enrollments.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Enrolled Programs</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.enrollments.map((enrollment, index) => (
                        <Badge key={index} variant="outline">
                          {enrollment.program.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Close</Button>
              <Button variant="outline" onClick={() => {
                if (selectedUser) {
                  router.push(`/user-management/${selectedUser.id}`);
                }
              }}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Full Details
              </Button>
              <Button onClick={() => {
                setShowDetailsDialog(false);
                if (selectedUser) handleEditUser(selectedUser);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}