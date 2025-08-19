// components/sections/VacancyAdvert.tsx
import { Button } from "@/components/ui/LinkAsButton";

export default function VacancyAdvert({ hasVacancy = true }) {
  if (!hasVacancy) return null; // Only render if vacancy exists

  return (
    <section className="mb-20 relative py-12 bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-indigo-500/10 dark:from-teal-400/10 dark:via-sky-400/10 dark:to-indigo-400/10">
      <div className="mx-auto max-w-5xl text-center px-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          We’re Hiring!
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Join Al-Itqan as a teacher and be part of shaping the next generation.
        </p>
        <div className="mt-6">
          <Button href="/vacancy" variant="primary" size="lg">
            View Vacancies
          </Button>
        </div>
      </div>
    </section>
  );
}
