"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

const testimonials = [
  {
    name: "Ahmed Ali",
    role: "Parent",
    text: "Al-Itqan has transformed the way my children learn. The balance between Arabic and Western curriculum is amazing.",
  },
  {
    name: "Fatimah Khan",
    role: "Student",
    text: "I love how flexible the platform is! I can take classes anywhere and still feel supported.",
  },
  {
    name: "Yusuf Ibrahim",
    role: "Teacher",
    text: "The tools for teaching and assessments are simple yet powerful. It makes online teaching smooth.",
  },
  {
    name: "Layla Noor",
    role: "Alumni",
    text: "My journey with Al-Itqan prepared me for higher education while keeping my values intact.",
  },
]

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const animRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    if (!trackRef.current) return

    const totalWidth = trackRef.current.scrollWidth / 2 // since we duplicate
    animRef.current = gsap.to(trackRef.current, {
      x: -totalWidth,
      duration: 30,
      ease: "linear",
      repeat: -1,
    })

    const el = trackRef.current
    el.addEventListener("mouseenter", () => animRef.current?.pause())
    el.addEventListener("mouseleave", () => animRef.current?.resume())

    return () => {
      animRef.current?.kill()
      el.removeEventListener("mouseenter", () => animRef.current?.pause())
      el.removeEventListener("mouseleave", () => animRef.current?.resume())
    }
  }, [])

  return (
    <section className="relative overflow-hidden py-20 bg-white dark:bg-slate-950 mt-20 w-screen">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center font-montserrat text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl w-4/5 mx-auto">
          What Our Students & Parents Say
        </h2>
      </div>

      {/* Carousel wrapper */}
      <div className="mt-12 relative w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex w-max gap-6"
        >
          {[...testimonials, ...testimonials].map((t, i) => (
            <div
              key={i}
              className="w-[22rem] shrink-0 rounded-2xl border border-black/10 bg-white p-6 shadow-sm
                dark:border-white/10 dark:bg-slate-900"
            >
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                “{t.text}”
              </p>
              <div className="mt-4">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {t.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
