import { Button } from "@/components/ui/LinkAsButton";
import { ProgramApplyForm } from "@/components/ProgramApplyForm";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

interface ProgramDetailProps {
  params: Promise<{ id: string }>;
}

async function getProgramWithPricing(programId: string) {
  try {
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        pricing: true,
        level: true,
        track: true,
      },
    });
    return program;
  } catch (error) {
    console.error("Error fetching program:", error);
    return null;
  }
}

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

// Mock data fallback for when DB is unavailable
const mockProgram = {
  id: "1",
  title: "Islamic Studies (Diploma)",
  description:
    "A comprehensive two-year program covering Quran, Hadith, Fiqh, and Aqeedah. Designed to give students a strong foundation in Islamic knowledge.",
  requirements: [
    "Completed secondary school or equivalent",
    "Ability to read the Quran",
    "Basic understanding of Arabic (recommended)",
  ],
  duration: "2 years",
  type: "Full-time",
};

export default async function ProgramDetail({
  params,
}: ProgramDetailProps) {
  const { id } = await params;
  const session = await auth();

  const program = await getProgramWithPricing(id);

  // Use database program if available, otherwise use mock
  const displayProgram = program || {
    id,
    name: mockProgram.title,
    description: mockProgram.description,
  };

  const requirements = [
    "Completed secondary school or equivalent",
    "Ability to read the Quran",
    "Basic understanding of Arabic (recommended)",
  ];

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        {displayProgram.name}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {displayProgram.description}
      </p>

      <h2 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
        Requirements
      </h2>
      <ul className="mt-2 list-disc pl-6 text-slate-600 dark:text-slate-300">
        {requirements.map((req, i) => (
          <li key={i}>{req}</li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Duration • Type
      </p>

      {/* Pricing Section */}
      {program && program.pricing && program.pricing.isActive ? (
        <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Enrollment Cost
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Original Price */}
            <div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Price
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {formatPrice(program.pricing.amount, program.pricing.currency)}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {program.pricing.billingCycle}
              </p>
            </div>

            {/* Discount Section (if applicable) */}
            {program.pricing.discountPercent && (
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">
                  Special Offer
                </p>
                <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                  {program.pricing.discountPercent}% OFF
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Pay now:{" "}
                  <span className="font-bold text-slate-900 dark:text-white text-lg">
                    {formatPrice(
                      calculateDiscountedPrice(
                        program.pricing.amount,
                        program.pricing.discountPercent
                      ) || program.pricing.amount,
                      program.pricing.currency
                    )}
                  </span>
                </p>
                {program.pricing.discountEndDate && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-500">
                    Valid until {new Date(program.pricing.discountEndDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {program.pricing.description && (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              {program.pricing.description}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6">
          <p className="text-slate-600 dark:text-slate-400">
            Pricing information is not available for this program yet. Please contact support.
          </p>
        </div>
      )}

      {/* Apply Section */}
      <div className="mt-8">
        {session?.user?.id ? (
          <ProgramApplyForm
            programId={program?.id ? program.id : id}
            programName={program?.name ? program.name : mockProgram.title}
            amount={program?.pricing?.amount ? Number(program.pricing.amount) : 0}
            currency={program?.pricing?.currency ? program.pricing.currency : "NGN"}
          />
        ) : (
          <Button
            href="/login"
            variant="primary"
            size="lg"
          >
            Login to Apply
          </Button>
        )}
      </div>
    </section>
  );
}
