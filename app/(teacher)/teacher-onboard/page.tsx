"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/LinkAsButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Client-side only toast
let toast: any = { loading: () => null, success: () => null, error: () => null };
let Toaster: any = () => null;

if (typeof window !== 'undefined') {
  const sonner = require('sonner');
  toast = sonner.toast;
  Toaster = sonner.Toaster;
}

// Define the Zod schema for form validation
const formSchema = z.object({
  bankName: z.string().min(1, { message: "Bank Name is required." }),
  accountName: z.string().min(1, { message: "Account Name is required." }),
  accountNumber: z.string().min(1, { message: "Account Number is required." }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions.",
  }),
});

const TeacherAcceptancePage = () => {
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      termsAccepted: false,
    },
  });

  const onSubmit = async (data) => {
    const toastId = toast.loading("Saving your details...");
    try {
      const res = await fetch("/api/teacher-onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save details");
      }

      setIsDataSubmitted(true);
      toast.success("Details saved successfully!", { id: toastId });
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error(`Failed to save details. ${error.message}`, { id: toastId });
    }
  };

  if (isDataSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Congratulations!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            You have successfully completed the onboarding process. You will be
            notified once you are assigned classes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {typeof window !== 'undefined' && <Toaster />}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-xl transform transition-transform duration-300">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
          Teacher Onboarding
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Please review the terms and conditions and provide your financial
          details to complete your application process.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Terms and Conditions Section */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Terms and Conditions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 h-32 overflow-y-scroll">
              Here are the terms and conditions for becoming a teacher on our
              platform. By accepting, you agree to these terms:
              <br />
              <br />
              1. **Payment Schedule:** Payments will be processed on the 1st of
              every month for the previous month's completed classes.
              <br />
              2. **Confidentiality:** All student and platform information must
              be kept confidential.
              <br />
              3. **Code of Conduct:** Teachers are expected to maintain a
              professional and respectful demeanor at all times.
              <br />
              4. **Termination:** We reserve the right to terminate your
              contract at any time for violation of these terms.
              <br />
              <br />
              By checking the box below, you acknowledge that you have read,
              understood, and agree to these terms.
            </p>
            <div className="flex items-center mt-4">
              <input
                id="terms"
                type="checkbox"
                {...form.register("termsAccepted")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-600 dark:border-gray-500"
              />
              <label
                htmlFor="terms"
                className="ml-2 text-gray-700 dark:text-gray-300"
              >
                I accept the terms and conditions
              </label>
            </div>
            {form.formState.errors.termsAccepted && (
              <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                {form.formState.errors.termsAccepted.message}
              </p>
            )}
          </div>

          {/* Financial Details Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Financial Details
            </h2>
            <div>
              <label
                htmlFor="bankName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Bank Name
              </label>
              <input
                id="bankName"
                type="text"
                {...form.register("bankName")}
                className="w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Bank of America"
              />
              {form.formState.errors.bankName && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                  {form.formState.errors.bankName.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="accountName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Account Holder Name
              </label>
              <input
                id="accountName"
                type="text"
                {...form.register("accountName")}
                className="w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Jane Doe"
              />
              {form.formState.errors.accountName && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                  {form.formState.errors.accountName.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="accountNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Account Number
              </label>
              <input
                id="accountNumber"
                type="text"
                {...form.register("accountNumber")}
                className="w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="e.g., 1234567890"
              />
              {form.formState.errors.accountNumber && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                  {form.formState.errors.accountNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            withIcon={false}
            variant="primary"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? "Saving..." : "Complete Onboarding"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TeacherAcceptancePage;
