"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  TrendingUp,
  BarChart3,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalPrograms: number;
  totalApplications: number;
  pendingApplications: number;
  pendingPayments: number;
  verifiedPayments: number;
  recentApplications: Array<{
    id: string;
    user: { name: string; email: string };
    type: string;
    status: string;
    createdAt: string;
    program?: { name: string };
  }>;
  recentPayments: Array<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    application: {
      user: { name: string };
      program: { name: string };
    };
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchDashboardStats();
    }
  }, [session?.user?.role]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium";

    const statusMap: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
      PENDING: {
        icon: <Clock className="h-3.5 w-3.5" />,
        className: `${baseClasses} bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300`,
        label: "Pending",
      },
      SUBMITTED: {
        icon: <Clock className="h-3.5 w-3.5" />,
        className: `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`,
        label: "Submitted",
      },
      APPROVED: {
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        className: `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`,
        label: "Approved",
      },
      REJECTED: {
        icon: <XCircle className="h-3.5 w-3.5" />,
        className: `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`,
        label: "Rejected",
      },
      VERIFIED: {
        icon: <CheckCircle className="h-3.5 w-3.5" />,
        className: `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`,
        label: "Verified",
      },
    };

    const badge = statusMap[status];
    if (!badge) {
      return <span className={baseClasses}>{status}</span>;
    }

    return (
      <span className={badge.className}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            System overview and key metrics
          </p>
        </div>

        {/* Quick Stats - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardStatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<Users className="h-5 w-5" />}
            subtext="Active student accounts"
          />
          <DashboardStatCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={<BookOpen className="h-5 w-5" />}
            subtext="Verified teachers"
          />
          <DashboardStatCard
            title="Programs"
            value={stats.totalPrograms}
            icon={<FileText className="h-5 w-5" />}
            subtext="Active programs"
          />
          <DashboardStatCard
            title="Pending Actions"
            value={stats.pendingApplications + stats.pendingPayments}
            icon={<Clock className="h-5 w-5" />}
            subtext="Applications & Payments"
            trend={{
              direction: stats.pendingApplications > 0 ? "up" : "down",
              value: stats.pendingApplications + " apps",
            }}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardStatCard
            title="Total Applications"
            value={stats.totalApplications}
            icon={<FileText className="h-5 w-5" />}
            subtext={`${stats.pendingApplications} pending`}
          />
          <DashboardStatCard
            title="Payment Status"
            value={stats.pendingPayments}
            icon={<CreditCard className="h-5 w-5" />}
            subtext={`${stats.verifiedPayments} verified`}
          />
          <DashboardStatCard
            title="System Health"
            value="Healthy"
            icon={<TrendingUp className="h-5 w-5" />}
            subtext="All systems operational"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Applications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Recent Applications
              </h2>
              <Button href="/approvals" variant="outline" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {stats.recentApplications.length === 0 ? (
              <Card className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    No recent applications
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Applications will appear here when students submit them.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {stats.recentApplications.slice(0, 5).map((app) => (
                  <Card
                    key={app.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition"
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                            {app.user.name}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {app.type === "STUDENT" ? "Program:" : "Position:"} {app.program?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {formatDate(app.createdAt)}
                          </p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                Recent Payments
              </h2>
              <Button href="/admin/payments" variant="outline" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {stats.recentPayments.length === 0 ? (
              <Card className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <CardContent className="pt-6 text-center">
                  <CreditCard className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    No recent payments
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Payment submissions will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {stats.recentPayments.slice(0, 5).map((payment) => (
                  <Card
                    key={payment.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition"
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                            {payment.application.user.name}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {payment.application.program.name}
                          </p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {formatCurrency(Number(payment.amount), payment.currency)}
                          </p>
                        </div>
                        {getStatusBadge(payment.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              href="/approvals"
              variant="outline"
              className="h-auto flex-col py-6 justify-center items-center gap-2 rounded-lg border-2"
            >
              <FileText className="h-6 w-6" />
              <span>Review Applications</span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {stats.pendingApplications} pending
              </span>
            </Button>
            <Button
              href="/admin/payments"
              variant="outline"
              className="h-auto flex-col py-6 justify-center items-center gap-2 rounded-lg border-2"
            >
              <CreditCard className="h-6 w-6" />
              <span>Review Payments</span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {stats.pendingPayments} pending
              </span>
            </Button>
            <Button
              href="/admin-program"
              variant="outline"
              className="h-auto flex-col py-6 justify-center items-center gap-2 rounded-lg border-2"
            >
              <BookOpen className="h-6 w-6" />
              <span>Manage Programs</span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {stats.totalPrograms} total
              </span>
            </Button>
            <Button
              href="/courses"
              variant="outline"
              className="h-auto flex-col py-6 justify-center items-center gap-2 rounded-lg border-2"
            >
              <FileText className="h-6 w-6" />
              <span>Manage Courses</span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                View & edit
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
