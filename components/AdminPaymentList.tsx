"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Clock,
} from "lucide-react";

interface Payment {
  id: string;
  status: string;
  amount: number;
  currency: string;
  receiptUrl: string;
  receiptFileName: string;
  approvalNotes?: string;
  createdAt: string;
  application: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    program: {
      id: string;
      name: string;
    };
  };
}

interface AdminPaymentListProps {
  initialPayments?: Payment[];
}

export function AdminPaymentList({
  initialPayments = [],
}: AdminPaymentListProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [loading, setLoading] = useState(!initialPayments.length);
  const [filterStatus, setFilterStatus] = useState("SUBMITTED");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [filterStatus]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/payments/admin?status=${filterStatus}`
      );
      if (!response.ok) {
        toast.error("Failed to fetch payments");
        return;
      }
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Error fetching payments");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/payments/admin/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "VERIFIED",
          approvalNotes,
        }),
      });

      if (!response.ok) {
        toast.error("Failed to approve payment");
        return;
      }

      toast.success("Payment approved successfully");
      setSelectedPayment(null);
      setApprovalNotes("");
      await fetchPayments();
    } catch (error) {
      console.error("Error approving payment:", error);
      toast.error("Error approving payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!approvalNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/payments/admin/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJECTED",
          approvalNotes,
        }),
      });

      if (!response.ok) {
        toast.error("Failed to reject payment");
        return;
      }

      toast.success("Payment rejected successfully");
      setSelectedPayment(null);
      setApprovalNotes("");
      await fetchPayments();
    } catch (error) {
      console.error("Error rejecting payment:", error);
      toast.error("Error rejecting payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium";

    switch (status) {
      case "SUBMITTED":
        return (
          <span
            className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`}
          >
            <Clock className="h-3.5 w-3.5" />
            Pending
          </span>
        );
      case "VERIFIED":
        return (
          <span
            className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Verified
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {["SUBMITTED", "VERIFIED", "REJECTED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filterStatus === status
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            No payments found with status: {filterStatus}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/30"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {payment.application.user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {payment.application.user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {payment.application.program.name}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(Number(payment.amount), payment.currency)}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setApprovalNotes(payment.approvalNotes || "");
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-lg max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Review Payment
            </h2>

            {/* Payment Details */}
            <div className="space-y-4 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">
                    Student Name
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedPayment.application.user.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">
                    Email
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedPayment.application.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">
                    Program
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedPayment.application.program.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">
                    Amount
                  </p>
                  <p className="font-bold text-lg text-slate-900 dark:text-white">
                    {formatCurrency(
                      Number(selectedPayment.amount),
                      selectedPayment.currency
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Receipt Preview */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Receipt
              </p>
              {selectedPayment.receiptUrl.toLowerCase().endsWith(".pdf") ? (
                <a
                  href={selectedPayment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                >
                  <FileText className="h-4 w-4" />
                  {selectedPayment.receiptFileName || "View PDF"}
                </a>
              ) : (
                <img
                  src={selectedPayment.receiptUrl}
                  alt="Receipt"
                  className="max-w-full h-auto rounded-lg border border-slate-200 dark:border-slate-700"
                />
              )}
            </div>

            {/* Notes Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                Admin Notes {selectedPayment.status === "REJECTED" && "(Rejection Reason)"}
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                disabled={selectedPayment.status !== "SUBMITTED"}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter notes or reason for rejection..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedPayment(null);
                  setApprovalNotes("");
                }}
                disabled={isProcessing}
              >
                Close
              </Button>

              {selectedPayment.status === "SUBMITTED" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedPayment.id)}
                    disabled={isProcessing || !approvalNotes.trim()}
                  >
                    {isProcessing ? "Processing..." : "Reject"}
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedPayment.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Approve"}
                  </Button>
                </>
              )}

              {selectedPayment.status !== "SUBMITTED" && (
                <div className="ml-auto">
                  {getStatusBadge(selectedPayment.status)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
