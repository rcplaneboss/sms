import { Button } from "@/components/ui/LinkAsButton";
import { prisma } from "@/prisma";

interface VacancyDetailProps {
  params: Promise<{ id: string }>;
}

export default async function VacancyDetail({
  params,
}: VacancyDetailProps) {
  const { id } = await params;

  const job = await prisma.vacancy.findUnique({
    where: {id},
    // rejectOnNotFound: true,
  });

  const { title, description, requirements = [], type } = job || {};

  if (!job) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-semibold">
          ❌ Vacancy not found.
        </p>
      </main>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {description}
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
        {job.type} • Online
      </p>

      <div className="mt-8">
        <Button href={`/apply-teacher?vacancyId=${job.id}`} variant="primary" size="lg">
          Apply Now
        </Button>
      </div>
    </section>
  );
}
