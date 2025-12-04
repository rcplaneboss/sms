import { Button } from "@/components/ui/LinkAsButton";
import { prisma } from "@/prisma";

async function getProgramsWithPricing() {
  try {
    const programs = await prisma.program.findMany({
      include: {
        pricing: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return programs;
  } catch (error) {
    console.error("Error fetching programs:", error);
    return [];
  }
}

const mockPrograms = [
  {
    id: 1,
    title: "Islamic Studies (Diploma)",
    description:
      "A two-year foundational program covering Quran, Hadith, and Fiqh.",
    duration: "2 years",
    type: "Full-time",
  },
  {
    id: 2,
    title: "Arabic Language Intensive",
    description:
      "Learn Arabic for comprehension of Islamic texts in a one-year intensive course.",
    duration: "1 year",
    type: "Part-time",
  },
];

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function calculateDiscountedPrice(
  amount: number,
  discountPercent?: number | null
) {
  if (!discountPercent) return null;
  return amount * (1 - discountPercent / 100);
}

export default async function ProgramsPage() {
  const programs = await getProgramsWithPricing();

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
        Available Programs
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Explore programs at Al-Itqan and apply directly from your dashboard.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {programs && programs.length > 0
          ? programs.map((program) => (
              <div
                key={program.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {program.name}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  {program.description}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Duration • Type
                </p>

                {/* Pricing Section */}
                {program.pricing && program.pricing.isActive ? (
                  <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Price
                    </p>
                    <div className="mt-1">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatPrice(program.pricing.amount, program.pricing.currency)}
                      </p>
                      {program.pricing.discountPercent && (
                        <div className="mt-1">
                          <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                            {program.pricing.discountPercent}% discount
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Now{" "}
                            {formatPrice(
                              calculateDiscountedPrice(
                                program.pricing.amount,
                                program.pricing.discountPercent
                              ) || program.pricing.amount,
                              program.pricing.currency
                            )}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {program.pricing.billingCycle}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Pricing not available
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    href={`/programs/${program.id}`}
                    variant="secondary"
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))
          : mockPrograms.map((program) => (
              <div
                key={program.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {program.title}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  {program.description}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {program.duration} • {program.type}
                </p>
                <div className="mt-4">
                  <Button
                    href={`/programs/${program.id}`}
                    variant="secondary"
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
