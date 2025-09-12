"use client";

import { useSession } from "next-auth/react";
import { LockKeyhole } from "lucide-react";
import Link from "next/link";

export default function AccessDeniedPage() {
  const { data: session } = useSession();

  // Decide where the user should go
  let redirectPath = "/login";
  let redirectLabel = "Login";

  if (session?.user?.id && session?.user?.role) {
    if (session.user.role === "teacher") {
      redirectPath = "/teacher-dashboard";
      redirectLabel = "Go to Teacher Dashboard";
    } else if (session.user.role === "student") {
      redirectPath = "/student-dashboard";
      redirectLabel = "Go to Student Dashboard";
    } else {
      redirectPath = "/";
      redirectLabel = "Go Home";
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900 px-6">
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Icon */}
        <div className="p-6 rounded-full bg-red-100 text-red-600">
          <LockKeyhole className="h-12 w-12" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-lg text-gray-600 max-w-md">
          Sorry, you don’t have permission to view this page.  
          Please log in with the correct account or return to your dashboard.
        </p>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href={redirectPath}
            className="rounded-xl bg-blue-600 px-6 py-2 text-white font-medium shadow hover:bg-blue-700 transition"
          >
            {redirectLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
