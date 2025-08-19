import Image from "next/image";
import { Button } from "@/components/ui/LinkAsButton";

export default function AboutSection() {
  return (
    <section className="py-20 md:py-28 bg-b-light dark:bg-b-dark">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Image */}
        <div className="relative w-full h-[400px] md:h-[500px]">
          <Image
            src="/images/about-school.jpg"
            alt="About the school"
            fill
            className="object-cover rounded-2xl shadow-md"
          />
        </div>

        {/* Right: Text */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            About <span className="text-p1-hex">AL-ITQAN</span>
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            EduGate Portal is designed to connect students, parents, and
            educators in one seamless digital platform. Our mission is to
            enhance learning experiences, improve communication, and provide
            access to valuable academic resources anytime, anywhere.
          </p>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Whether you’re exploring training programs, tracking progress, or
            staying updated with the latest events, EduGate ensures a smooth,
            engaging, and modern approach to education.
          </p>

         <Button href="/about" variant="primary" size="md" withIcon>
           Learn More
         </Button>
        </div>
      </div>
    </section>
  );
}
