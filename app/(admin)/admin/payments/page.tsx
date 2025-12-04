import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { AdminPaymentList } from "@/components/AdminPaymentList";

export default async function AdminPaymentsPage() {
  const session = await auth();

  // Check if user is admin
  if (session?.user?.role !== "ADMIN") {
    redirect("/access-denied");
  }

  // Fetch all payments for initial load
  let payments = [];
  try {
    payments = await prisma.payment.findMany({
      where: {
        status: "SUBMITTED",
      },
      include: {
        application: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            program: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Payment Verification
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            Review and approve student payment submissions
          </p>
        </div>

        <AdminPaymentList initialPayments={payments as any} />
      </div>
    </div>
  );
}
