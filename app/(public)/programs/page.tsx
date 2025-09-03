import { Button } from "@/components/ui/LinkAsButton";

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

export default function ProgramsPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
        Available Programs
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Explore programs at Al-Itqan and apply directly from your dashboard.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {mockPrograms.map((program) => (
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
