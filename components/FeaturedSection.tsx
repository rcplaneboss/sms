import { BookOpen, GraduationCap, Globe } from "lucide-react";

export default function FeatureHighlights() {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-p1-hex" />,
      title: "Expert Instruction",
      description:
        "Learn from skilled educators with years of classroom and online teaching experience.",
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-s1-hex" />,
      title: "Training Courses",
      description:
        "Access curated training programs that fit different learning styles and career paths.",
    },
    {
      icon: <Globe className="w-8 h-8 text-accent-hex" />,
      title: "Lifetime Access",
      description:
        "Study at your own pace with resources and courses available whenever you need them.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
          Why Choose <span className="text-p1-hex">AL-ITQAN</span>?
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-card text-card-foreground shadow-sm rounded-2xl p-8 transition hover:shadow-md"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-muted">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
