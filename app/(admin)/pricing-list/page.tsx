import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma";
import { PricingList } from "@/components/PricingList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Pricing Management | Admin",
  description: "View and manage all program pricing",
};

export default async function PricingListPage() {
  const session = await auth();

  // Only admins can access this page
  if (session?.user?.role !== "ADMIN") {
    redirect("/access-denied");
  }

  // Fetch all pricing with program details
  const pricing = await prisma.pricing.findMany({
    include: {
      program: {
        include: {
          level: true,
          track: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Convert Decimal to number for display
  const formattedPricing = pricing.map((p) => ({
    ...p,
    amount: Number(p.amount),
  }));

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              Pricing Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-slate-400">
              Manage pricing for all your programs
            </p>
          </div>
          <Link href="/set-pricing">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Pricing
            </Button>
          </Link>
        </div>

        <div className="rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-gray-200 dark:border-slate-800">
          <PricingList pricing={formattedPricing} />
        </div>
      </div>
    </main>
  );
}
