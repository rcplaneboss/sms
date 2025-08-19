"use client";

import { useEffect, useRef } from "react";
import { BookOpen, Globe, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/LinkAsButton";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const programs = [
  {
    title: "Arabic Track",
    description:
      "Focused on Islamic studies, Qur’an memorization, Arabic language mastery, and spiritual development.",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-400",
  },
  {
    title: "Western Track",
    description:
      "Blend modern education with core Islamic values — covering sciences, math, languages, and critical thinking.",
    icon: Globe,
    color: "from-blue-500 to-indigo-400",
  },
  {
    title: "Special Programs",
    description:
      "Seasonal workshops, online intensives, and tailored learning paths for students with unique goals.",
    icon: GraduationCap,
    color: "from-purple-500 to-pink-400",
  },
];

export default function Programs() {
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const iconsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // Animate cards on scroll
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: i * 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        }
      );
    });

    // Floating animation for icons
    iconsRef.current.forEach((icon, i) => {
      if (!icon) return;
      gsap.to(icon, {
        y: -8,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay: i * 0.3,
      });
    });
  }, []);

  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl px-6 text-center">
        {/* Section Header */}
        <h2 className="text-3xl font-extrabold font-montserrat text-slate-900 sm:text-4xl dark:text-white">
          Our Programs
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-base text-slate-600 dark:text-slate-400">
          Choose your learning path — rooted in tradition, adapted for today.
        </p>

        {/* Program Cards */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800 dark:ring-slate-700"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-10 group-hover:opacity-20 transition`}
              />
              <div className="relative p-8 flex flex-col items-center text-center">
                <div
                  ref={(el) => {
                    if (el) iconsRef.current[i] = el;
                  }}
                  className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${program.color} text-white`}
                >
                  <program.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {program.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  {program.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-12">
          <Button href="/(public)/programs" variant="primary" size="lg">
            View All Programs
          </Button>
        </div>
      </div>
    </section>
  );
}
