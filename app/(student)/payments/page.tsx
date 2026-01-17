"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";

interface StudentPayment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  receiptUrl: string;
  createdAt: string;
  approvalNotes?: string;
  application: {
    id: string;
    program: {
      id: string;
      name: string;
    };
  };
}

export default function StudentPaymentsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchPayments();
    }
  }, [session?.user?.id]);

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments/student");
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium";

    switch (status) {
      case "PENDING":
        return (
          <span
            className={`${baseClasses} bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300`}
          >
            <FileText className="h-3.5 w-3.5" />
            Not Submitted
          </span>
        );
      case "SUBMITTED":
        return (
          <span
            className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}
          >
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </span>
        );
      case "VERIFIED":
        return (
          <span
            className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span
            className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`}
          >
            <XCircle className="h-3.5 w-3.5" />
            Rejected
          </span>
        );
      default:
        return <span className={baseClasses}>{status}</span>;
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            My Payments
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            Track your program application payments and their status
          </p>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No payments yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              You haven't submitted any payment receipts yet. Apply for a program to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {payment.application.program?.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Submitted on {formatDate(payment.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(Number(payment.amount), payment.currency)}
                    </p>
                    <div className="mt-2">{getStatusBadge(payment.status)}</div>
                  </div>
                </div>

                {/* Rejection Reason */}
                {payment.status === "REJECTED" && payment.approvalNotes && (
                  <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 p-3">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                      Rejection Reason:
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                      {payment.approvalNotes}
                    </p>
                  </div>
                )}

                {/* Receipt Link */}
                {payment.receiptUrl && (
                  <div className="mt-4">
                    <a
                      href={payment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Receipt
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
