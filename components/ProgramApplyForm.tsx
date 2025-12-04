"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { PaymentSubmission } from "@/components/PaymentSubmission";
import { toast } from "sonner";
import { FileText } from "lucide-react";

interface ProgramApplyFormProps {
  programId: string;
  programName: string;
  amount: number;
  currency: string;
}

export function ProgramApplyForm({
  programId,
  programName,
  amount,
  currency,
}: ProgramApplyFormProps) {
  const { data: session } = useSession();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Check if user already has an application for this program
  useEffect(() => {
    if (session?.user?.id && programId) {
      checkExistingApplication();
    }
  }, [session?.user?.id, programId]);

  const checkExistingApplication = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(
        `/api/applications?programId=${programId}&userId=${session.user.id}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.application) {
          setApplicationId(data.application.id);
          setHasApplied(true);
        }
      } else if (response.status !== 404) {
        console.error("Error checking application:", response.statusText);
      }
    } catch (error) {
      console.error("Error checking application:", error);
    }
  };

  const handleApply = async () => {
    if (!session?.user?.id) {
      toast.error("Please login to apply");
      window.location.href = "/login";
      return;
    }

    if (!programId) {
      toast.error("Program ID is missing. Please reload the page.");
      console.error("ProgramApplyForm: programId is missing", { programId });
      return;
    }

    setIsApplying(true);
    try {
      const payload = {
        programId,
        type: "STUDENT",
      };
      console.log("Submitting application with payload:", payload);

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || `Failed to apply (${response.status})`;
        console.error("Apply error:", errorMsg, data);
        toast.error(errorMsg);
        return;
      }

      console.log("Application created:", data.application);
      setApplicationId(data.application.id);
      setHasApplied(true);
      toast.success("Application submitted! Now complete your payment.");
    } catch (error) {
      console.error("Error applying:", error);
      toast.error("An error occurred while applying. Check console for details.");
    } finally {
      setIsApplying(false);
    }
  };

  if (applicationId && hasApplied) {
    return (
      <div className="space-y-6">
        {/* Application Confirmation */}
        <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 p-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Application Submitted Successfully
              </h3>
              <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                Your application has been received. Please proceed with payment to complete your enrollment.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Submission Component */}
        <PaymentSubmission
          applicationId={applicationId}
          programName={programName}
          amount={amount}
          currency={currency}
          onSuccess={() => {
            toast.success("Payment submitted! Awaiting admin verification.");
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        To enroll in this program, you need to apply and submit your payment.
      </p>
      <Button
        onClick={handleApply}
        disabled={isApplying}
        size="lg"
        className="w-full"
      >
        {isApplying ? "Submitting Application..." : "Apply for This Program"}
      </Button>
    </div>
  );
}
