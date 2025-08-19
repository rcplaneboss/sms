
import { Button } from "@/components/ui/LinkAsButton";

const mockVacancies = [
  {
    id: 1,
    title: "Arabic Teacher",
    location: "Remote",
    type: "Part-time",
    description: "Teach Arabic to students online, flexible hours.",
  },
  {
    id: 2,
    title: "Math Teacher (Western Track)",
    location: "On-site (Lagos)",
    type: "Full-time",
    description: "Prepare lesson plans and deliver engaging math classes.",
  },
];

export default function VacancyPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
        Current Vacancies
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Explore open positions at Al-Itqan and apply today.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {mockVacancies.map((vacancy) => (
          <div
            key={vacancy.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {vacancy.title}
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {vacancy.description}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {vacancy.type} • Online
            </p>
            <div className="mt-4">
              <Button
                href={`/vacancy/${vacancy.id}`}
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
