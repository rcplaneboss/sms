import { Button } from "@/components/ui/LinkAsButton";

export default function ProgramDetail({ params }: { params: { id: string } }) {
  const { id } = params;

  // Mock data (later fetch from DB)
  const program = {
    id,
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

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        {program.title}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {program.description}
      </p>

      <h2 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
        Requirements
      </h2>
      <ul className="mt-2 list-disc pl-6 text-slate-600 dark:text-slate-300">
        {program.requirements.map((req, i) => (
          <li key={i}>{req}</li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        {program.duration} • {program.type}
      </p>

      <div className="mt-8">
        <Button
          href={`/apply-program?programId=${program.id}`}
          variant="primary"
          size="lg"
        >
          Apply Now
        </Button>
      </div>
    </section>
  );
}
