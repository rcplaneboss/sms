"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  teacherApplicationSchema,
  TeacherApplicationValues,
} from "@/prisma/schema";
import { Button } from "@/components/ui/button";
import { Button as LinkAsButton } from "@/components/ui/LinkAsButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import { ArrowLeftIcon } from "lucide-react";

const steps = ["Education", "Experience", "Skills", "Documents", "Screening"];

export default function TeacherApplicationForm({
  vacancyId,
  userId,
}: {
  vacancyId: string;
  userId: string;
}) {
  const [step, setStep] = useState(0);

  const form = useForm<TeacherApplicationValues>({
    resolver: zodResolver(teacherApplicationSchema),
    defaultValues: {
      vacancyId,
      certifications: [],
      languages: [],
      techSkills: [],
    },
  });

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (values: TeacherApplicationValues) => {
    const formData = new FormData();

    formData.append("userId", userId);
    formData.append("vacancyId", vacancyId);

    // append normal fields
    Object.entries(values).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const resume = (document.getElementById("resume") as HTMLInputElement)
      ?.files?.[0];
    const certificates = (
      document.getElementById("certificates") as HTMLInputElement
    )?.files?.[0];

    if (resume) formData.append("resume", resume);
    if (certificates) formData.append("certificates", certificates);

    const res = await fetch("/api/apply/teacher?type=application", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Application submitted!");
    } else {
      alert("Something went wrong");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto space-y-8 p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-900 font-mono border border-gray-200 dark:border-gray-700"
    >
      {/* Step Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-p1-hex font-sans">
          {steps[step]}
        </h2>
        <p className="text-sm text-black dark:text-white">
          Step {step + 1} of {steps.length}
        </p>
      </div>

      {/* Step 0: Education */}
      {step === 0 && (
        <div className="space-y-4">
          <Input
            placeholder="Highest Degree"
            {...form.register("highestDegree")}
            className="w-full"
          />
          <Input
            placeholder="Certifications (comma separated)"
            onBlur={(e) =>
              form.setValue(
                "certifications",
                e.target.value.split(",").map((c) => c.trim())
              )
            }
            className="w-full"
          />
        </div>
      )}

      {/* Step 1: Experience */}
      {step === 1 && (
        <div className="space-y-4">
          <Input
            type="number"
            placeholder="Years of Experience"
            {...form.register("experienceYears")}
            className="w-full"
          />
          <Textarea
            placeholder="Achievements"
            {...form.register("achievements")}
            className="w-full"
          />
        </div>
      )}

      {/* Step 2: Skills */}
      {step === 2 && (
        <div className="space-y-4">
          <Input
            placeholder="Languages (comma separated)"
            onBlur={(e) =>
              form.setValue(
                "languages",
                e.target.value.split(",").map((c) => c.trim())
              )
            }
            className="w-full"
          />
          <Input
            placeholder="Tech Skills (comma separated)"
            onBlur={(e) =>
              form.setValue(
                "techSkills",
                e.target.value.split(",").map((c) => c.trim())
              )
            }
            className="w-full"
          />
        </div>
      )}

      {/* Step 3: Documents */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium font-mono mb-1">
              Resume (PDF)
            </Label>
            <Input type="file" id="resume" accept=".pdf" className="w-full" />
          </div>
          <div>
            <Label className="block text-sm font-medium font-mono mb-1">
              Certificates (PDF/ZIP)
            </Label>
            <Input
              type="file"
              id="certificates"
              accept=".pdf,.zip"
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Step 4: Screening */}
      {step === 4 && (
        <div className="space-y-4">
          <Textarea
            placeholder="Why do you want to teach with us?"
            {...form.register("motivation")}
            className="w-full"
          />
          <Input
            placeholder="Available Equipment (Laptop, Mic...)"
            {...form.register("equipment")}
            className="w-full"
          />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        {step > 0 && (
          <LinkAsButton
            type="button"
            onClick={back}
            className="cursor-pointer"
            size={"sm"}
            variant={"secondary"}
            withIcon={false}
            icon={false}
          >
            Back
          </LinkAsButton>
        )}
        {step < steps.length - 1 ? (
          <LinkAsButton
            type="button"
            onClick={next}
            className="cursor-pointer"
            size={"sm"}
            variant={"secondary"}
          >
            Next
          </LinkAsButton>
        ) : (
          <LinkAsButton
            type="submit"
            className="cursor-pointer"
            size={"sm"}
            variant={"primary"}
          >
            Submit
          </LinkAsButton>
        )}
      </div>
    </form>
  );
}
