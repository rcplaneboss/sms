
import { Button } from "@/components/ui/LinkAsButton";

export default function VacancyDetail({ params }: { params: { id: string } }) {
  const { id } = params;

  // Mock data (later fetch from DB)
  const job = {
    id,
    title: "Arabic Teacher",
    description:
      "We are looking for a passionate Arabic Teacher to join our team at Al-Itqan. Responsibilities include preparing lesson materials, delivering engaging online classes, and evaluating student progress.",
    requirements: [
      "Bachelor’s degree in Arabic, Education, or related field",
      "Prior teaching experience",
      "Strong communication skills",
    ],
    location: "Remote",
    type: "Part-time",
  };

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        {job.title}
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {job.description}
      </p>

      <h2 className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
        Requirements
      </h2>
      <ul className="mt-2 list-disc pl-6 text-slate-600 dark:text-slate-300">
        {job.requirements.map((req, i) => (
          <li key={i}>{req}</li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        {job.type} • Online
      </p>

      <div className="mt-8">
        <Button href="/register" variant="primary" size="lg">
          Apply Now
        </Button>
      </div>
    </section>
  );
}
