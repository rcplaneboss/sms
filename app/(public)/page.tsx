import Hero from "@/components/Hero";
import FeaturedSection from "@/components/FeaturedSection";
import AboutSection from "@/components/AboutSchool";
import { FeaturesSection } from "@/components/FeaturesSection";
import TestimonialsCarousel from "@/components/Testimonials";
import Programs from "@/components/Program";
import Cta from "@/components/Cta";
import VacancySection from "@/components/VacancySection";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-12 dark:bg-b-dark bg-b-light">
      <Hero />
      <FeaturedSection />
      <AboutSection />
      <FeaturesSection />
      <TestimonialsCarousel />
      <Programs />
      <Cta />
      <VacancySection />
    </main>
  );
}
