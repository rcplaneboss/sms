
import { Button } from "@/components/ui/LinkAsButton";

export default function CallToAction() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden mb-6">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-teal-500/10 via-sky-400/10 to-indigo-500/10 dark:from-teal-500/20 dark:via-sky-500/20 dark:to-indigo-500/20" />

      <div className="mx-auto max-w-4xl text-center px-6">
        <h2 className="font-montserrat text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          Start Your Learning Journey with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 dark:from-teal-300 dark:via-sky-300 dark:to-indigo-300">
            Al-Itqan
          </span>
        </h2>
        <p className="mt-6 text-lg font-poppins text-slate-600 dark:text-white/70 max-w-2xl mx-auto">
          Enroll today in our Arabic & Western tracks. Join live lessons, take
          exams, and grow with a community of learners dedicated to excellence.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/(public)/register" variant="primary" size="lg">
            Register Now
          </Button>
          <Button href="/(public)/pricing" variant="secondary" size="lg">
            See Pricing
          </Button>
        </div>
      </div>
    </section>
  );
}
