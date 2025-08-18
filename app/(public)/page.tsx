import Hero from "@/components/Hero";
import FeaturedSection from "@/components/FeaturedSection";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center  px-12  dark:bg-b-dark bg-b-light">
      <Hero />
      <FeaturedSection />
    </main>
  );
}
