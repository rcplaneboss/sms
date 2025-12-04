import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma";
import { PricingForm } from "@/components/PricingForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Edit Pricing | Admin",
  description: "Edit program pricing",
};

interface EditPricingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPricingPage({
  params,
}: EditPricingPageProps) {
  const session = await auth();
  const { id } = await params;

  // Only admins can access this page
  if (session?.user?.role !== "ADMIN") {
    redirect("/access-denied");
  }

  // Fetch pricing for this program
  const pricing = await prisma.pricing.findUnique({
    where: { programId: id },
  });

  if (!pricing) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-slate-950 px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <Link href="/admin/pricing-list">
            <Button variant="outline" size="sm" className="mb-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 p-6">
            <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Pricing Not Found
            </h2>
            <p className="mt-2 text-sm text-red-700 dark:text-red-200">
              The pricing you are looking for does not exist.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Fetch all programs for the dropdown
  const programs = await prisma.program.findMany({
    include: {
      level: true,
      track: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Convert Decimal to number for the form
  const formattedPricing = {
    ...pricing,
    amount: Number(pricing.amount),
    discountEndDate: pricing.discountEndDate
      ? pricing.discountEndDate.toISOString()
      : undefined,
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin/pricing-list">
          <Button variant="outline" size="sm" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Edit Pricing</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            Update pricing for{" "}
            <span className="font-semibold">{programs.find((p) => p.id === id)?.name}</span>
          </p>
        </div>

        <div className="rounded-lg bg-white dark:bg-slate-900 p-8 shadow-sm border border-gray-200 dark:border-slate-800">
          <PricingForm
            programs={programs}
            initialPricing={formattedPricing}
            isEditing={true}
          />
        </div>
      </div>
    </main>
  );
}
