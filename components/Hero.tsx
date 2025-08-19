"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Button } from "@/components/ui/LinkAsButton"

export default function Hero() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } })

      tl.from(".hero-tagline", { y: -20, opacity: 0 })
        .from(".hero-heading", { y: 30, opacity: 0 }, "-=0.6")
        .from(".hero-subheading", { y: 30, opacity: 0 }, "-=0.7")
        .from(".hero-buttons", { y: 40, opacity: 0, stagger: 0.2 }, "-=0.6")
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/premium-photo/modern-workspace-with-open-laptop-books_893571-26354.jpg')",
        }}
      />
      <span className="absolute inset-0 -z-10 bg-white/80 dark:bg-slate-950/80" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/80 via-white/70 to-white/90 dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-950/90" />

      {/* Radial Glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full 
        bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
        from-teal-500/20 via-sky-400/10 to-transparent blur-3xl 
        dark:from-teal-500/25 dark:via-sky-500/15 dark:to-transparent"
      />

      {/* Content */}
      <div
        ref={containerRef}
        className="mx-auto grid max-w-6xl place-items-center px-6 py-28 text-center sm:py-36"
      >
        {/* Tagline */}
        <span
          className="hero-tagline mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1 
          text-xs text-black/70 backdrop-blur 
          dark:border-white/10 dark:bg-white/5 dark:text-white/70"
        >
          <span className="h-2 w-2 rounded-full bg-teal-500/80" />
          Admissions now open • Arabic & Western Tracks
        </span>

        {/* Heading */}
        <h1
          className="hero-heading font-montserrat text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl 
          dark:text-white"
        >
          Learn Anywhere.{" "}
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500 
            dark:from-teal-300 dark:via-sky-300 dark:to-indigo-300"
          >
            Excel Everywhere.
          </span>
        </h1>

        {/* Subheading */}
        <p
          className="hero-subheading mt-5 max-w-2xl font-poppins text-base leading-7 text-slate-600 sm:text-lg 
          dark:text-white/70"
        >
          Register, get approved, and start lessons on your preferred social
          platform. Take secure exams, see live scores, and download term
          results as PDFs.
        </p>

        {/* Buttons */}
        <div className="hero-buttons mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/(public)/register" variant="primary" size="lg">
            Get Started
          </Button>
          <Button href="/(public)/pricing" variant="secondary" size="lg">
            See Pricing
          </Button>
        </div>
      </div>
    </section>
  )
}
