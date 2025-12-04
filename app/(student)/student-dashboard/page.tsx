"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
  ClipboardList,
  CreditCard,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface StudentApplication {
  id: string;
  program: {
    name: string;
    id: string;
  };
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface StudentPayment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  application: {
    program: {
      name: string;
    };
  };
  createdAt: string;
}

interface StudentClass {
  id: string;
  courseId: string;
  course: {
    name: string;
    subject: {
      name: string;
    };
  };
  teacher: {
    user: {
      name: string;
    };
  };
}

export default function StudentDashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session?.user?.id]);

  const fetchDashboardData = async () => {
    try {
      const [appsRes, paymentsRes, classesRes] = await Promise.all([
        fetch("/api/student/applications"),
        fetch("/api/payments/student"),
        fetch("/api/student/classes"),
      ]);

      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(Array.isArray(data) ? data : []);
      }

      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(Array.isArray(data) ? data : []);
      }

      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const approvedApps = applications.filter((a) => a.status === "APPROVED").length;
  const pendingPayments = payments.filter((p) => p.status === "PENDING" || p.status === "SUBMITTED").length;
  const verifiedPayments = payments.filter((p) => p.status === "VERIFIED").length;

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium";
    
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
            Welcome back, {session?.user?.name || "Student"}!
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Here's an overview of your applications, payments, and classes.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardStatCard
            title="Applications"
            value={applications.length}
            icon={<FileText className="h-5 w-5" />}
            subtext={approvedApps > 0 ? `${approvedApps} approved` : "No approvals yet"}
          />
          <DashboardStatCard
            title="Payments"
            value={payments.length}
            icon={<CreditCard className="h-5 w-5" />}
            subtext={verifiedPayments > 0 ? `${verifiedPayments} verified` : "No verified payments"}
          />
          <DashboardStatCard
            title="Active Classes"
            value={classes.length}
            icon={<BookOpen className="h-5 w-5" />}
            subtext="Classes assigned to you"
          />
          <DashboardStatCard
            title="Pending Actions"
            value={pendingPayments}
            icon={<Clock className="h-5 w-5" />}
            subtext="Awaiting admin review"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Applications Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  My Applications
                </h2>
                <Button href="/programs" variant="outline" size="sm">
                  Apply to Programs
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {applications.length === 0 ? (
                <Card className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <CardContent className="pt-6 text-center">
                    <FileText className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      No applications yet
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Browse available programs to start your application.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <Card
                      key={app.id}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition"
                    >
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {app.program.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Applied on {formatDate(app.createdAt)}
                            </p>
                          </div>
                          <div className="flex flex-col items-start md:items-end gap-2">
                            {getStatusBadge(app.status)}
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              Payment: {app.paymentStatus}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Classes Section */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                My Classes
              </h2>

              {classes.length === 0 ? (
                <Card className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <CardContent className="pt-6 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      No classes yet
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Classes will appear here once you're enrolled in a program.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {classes.map((cls) => (
                    <Card
                      key={cls.id}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition"
                    >
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {cls.course.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {cls.course.subject.name} • Taught by {cls.teacher?.user?.name || "Unknown"}
                            </p>
                          </div>
                          <Button href={`/classes/${cls.id}`} variant="outline" size="sm">
                            View Class
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Payments Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                Payments
              </h2>

              {payments.length === 0 ? (
                <Card className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <CardContent className="pt-6 text-center">
                    <CreditCard className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      No payments yet
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Submit payments after applying to programs.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {payments.slice(0, 3).map((payment) => (
                    <Card
                      key={payment.id}
                      className="rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {payment.application.program.name}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {formatCurrency(Number(payment.amount), payment.currency)}
                            </p>
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {payments.length > 3 && (
                    <Button href="/payments" variant="outline" size="sm" className="w-full">
                      View All ({payments.length})
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <ArrowRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                Quick Links
              </h2>
              <div className="space-y-2">
                <Button href="/programs" variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Browse Programs
                </Button>
                <Button href="/payments" variant="outline" size="sm" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  View All Payments
                </Button>
                <Button href="/profile" variant="outline" size="sm" className="w-full justify-start">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  My Profile
                </Button>
                <Button href="/settings" variant="outline" size="sm" className="w-full justify-start">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
