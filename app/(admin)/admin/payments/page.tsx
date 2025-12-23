import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { AdminPaymentList } from "@/components/AdminPaymentList";

// ... your imports

export default async function AdminPaymentsPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/access-denied");
  }

  let payments = [];
  try {
    const rawPayments = await prisma.payment.findMany({
      where: { status: "SUBMITTED" },
      include: {
        application: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            program: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    console.log("Raw Payments:", rawPayments);
    
    // Convert Decimal and Date objects to plain types
    payments = rawPayments.map((payment) => ({
      ...payment,
      amount: payment.amount.toNumber(), 
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      application: {
        ...payment.application,
        createdAt: payment.application.createdAt.toISOString(),
        updatedAt: payment.application.updatedAt.toISOString(),
      }
    }));

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

        <AdminPaymentList initialPayments={payments} />
      </div>
    </div>
  );
}