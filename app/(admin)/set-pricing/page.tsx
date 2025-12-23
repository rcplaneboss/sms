import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma";
import { PricingForm } from "@/components/PricingForm";

export const metadata = {
  title: "Create Pricing | Admin",
  description: "Create pricing for programs",
};

export default async function SetPricingPage() {
  const session = await auth();

  // Only admins can access this page
//   if (session?.user?.role !== "ADMIN") {
//     redirect("/access-denied");
//   }

  // Fetch all programs
  const programs = await prisma.program.findMany({
    include: {
      level: true,
      track: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  if (programs.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-slate-950 px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-yellow-200 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/20 p-6">
            <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
              No Programs Available
            </h2>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
              Please create programs first before setting pricing.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Create Pricing</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            Set pricing for your programs. Each program can have one pricing.
          </p>
        </div>

        <div className="rounded-lg bg-white dark:bg-slate-900 p-8 shadow-sm border border-gray-200 dark:border-slate-800">
          <PricingForm programs={programs} />
        </div>
      </div>
    </main>
  );
}
