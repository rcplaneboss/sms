"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, Clock, FileUp } from "lucide-react";

interface PaymentSubmissionProps {
  applicationId: string;
  programName: string;
  amount: number;
  currency: string;
  onSuccess?: () => void;
}

export function PaymentSubmission({
  applicationId,
  programName,
  amount,
  currency,
  onSuccess,
}: PaymentSubmissionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "submitted" | "verified" | "rejected" | null>(null);
  const [approvalNotes, setApprovalNotes] = useState<string>("");

  // Fetch current payment status
  const fetchPaymentStatus = async () => {
    try {
      const res = await fetch(
        `/api/payments/submit?applicationId=${applicationId}`
      );
      const data = await res.json();

      if (data.payment) {
        setPaymentStatus(data.payment.status.toLowerCase());
        if (data.payment.approvalNotes) {
          setApprovalNotes(data.payment.approvalNotes);
        }
      }
    } catch (error) {
      console.error("Error fetching payment status:", error);
    }
  };

  // Fetch status on mount
  const handleCheckStatus = async () => {
    await fetchPaymentStatus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must not exceed 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error(
          "Only PDF and image files (JPEG, PNG, WebP) are allowed"
        );
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a receipt file");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("receipt", file);
      formData.append("applicationId", applicationId);

      const response = await fetch("/api/payments/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to submit payment");
        return;
      }

      const data = await response.json();
      setPaymentStatus("submitted");
      setFile(null);
      toast.success(data.message);

      // Call onSuccess callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("An error occurred while submitting payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Program & Amount Summary */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Payment Details
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Program:</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {programName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Amount:</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency,
              }).format(amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {paymentStatus === "submitted" && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 p-4">
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              Payment Submitted
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
              Your payment receipt has been received. Our admin team will verify
              it within 24-48 hours.
            </p>
          </div>
        </div>
      )}

      {paymentStatus === "verified" && (
        <div className="flex items-start gap-3 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 p-4">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100">
              Payment Verified
            </h4>
            <p className="text-sm text-green-700 dark:text-green-200 mt-1">
              Your payment has been verified successfully. Your application is
              now being processed.
            </p>
          </div>
        </div>
      )}

      {paymentStatus === "rejected" && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-4">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 dark:text-red-100">
              Payment Rejected
            </h4>
            {approvalNotes && (
              <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                <strong>Reason:</strong> {approvalNotes}
              </p>
            )}
            <p className="text-sm text-red-700 dark:text-red-200 mt-2">
              Please review and resubmit your payment receipt.
            </p>
          </div>
        </div>
      )}

      {/* Upload Form */}
      {!paymentStatus || paymentStatus === "rejected" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900 dark:text-white">
              Upload Receipt *
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="block w-full text-sm text-slate-500 dark:text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  dark:file:bg-blue-900/40 dark:file:text-blue-300
                  hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                  cursor-pointer border border-slate-300 dark:border-slate-700 rounded-lg p-3"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Accepted formats: PDF, JPEG, PNG, WebP (Max 5MB)
            </p>
            {file && (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ {file.name} selected
              </p>
            )}
          </div>

          <div>
            <Button
              type="submit"
              disabled={!file || isSubmitting}
              className="w-full"
            >
              <FileUp className="h-4 w-4 mr-2" />
              {isSubmitting ? "Uploading..." : "Submit Payment Receipt"}
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          onClick={handleCheckStatus}
          className="w-full"
        >
          Check Status
        </Button>
      )}
    </div>
  );
}
