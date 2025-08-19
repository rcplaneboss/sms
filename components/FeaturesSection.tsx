import { BookOpen, ShieldCheck, Timer, Users } from "lucide-react";
import { Button } from "@/components/ui/LinkAsButton";

const features = [
  {
    icon: BookOpen,
    title: "Interactive Learning",
    description:
      "Engage with modern tools and structured content designed for effective knowledge retention.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Exams",
    description:
      "Robust exam platform ensuring fairness, integrity, and a smooth testing experience.",
  },
  {
    icon: Timer,
    title: "Real-Time Results",
    description:
      "Get instant feedback and results analysis to track progress and improvement.",
  },
  {
    icon: Users,
    title: "Community & Support",
    description:
      "Learn together with peers and get guidance from experienced educators.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Section Heading */}
        <h2 className="text-3xl font-bold mb-4 text-foreground">
          Why Choose <span className="text-blue-600 dark:text-blue-400">Al-Itqan</span>?
        </h2>
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
          Designed for students and educators, Al-Itqan brings simplicity,
          security, and innovation into learning and assessments.
        </p>

        {/* Features Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl shadow-md border border-border bg-card text-card-foreground hover:shadow-lg transition"
            >
              <feature.icon className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16">
          <Button href="/register" size="lg" variant="secondary">
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
}
