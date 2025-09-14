"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TeacherProfileInput, teacherProfileSchema } from "@/prisma/schema";
import { useState } from "react";

type Props = {
  userId: string;
  onComplete: () => void;
};

export default function TeacherProfileForm({ userId, onComplete }: Props) {
  const [err, setErr] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherProfileInput>({
    mode: "all",
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      userId,
    },
  });

  const onSubmit = async (data: TeacherProfileInput) => {
    console.log("Submitting data:", data);
    const formData = new FormData();
    formData.append("userId", userId);
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof TeacherProfileInput];
      if (Array.isArray(value)) {
        formData.append(key, value.join(","));
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    try {
      const response = await fetch("/api/apply/teacher?type=profile", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        onComplete();
      } else {
        const res = await response.json();
        setErr(res.error || "Something went wrong");
        console.log("Error response:", res);
      }
    } catch (error: any) {
      setErr(error.message || "Something went wrong");
       console.log("Error response:", res);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 mb-12")}>
      <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-sans text-p1-hex">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-sm font-mono text-t-dark dark:text-t-light">
            Fill in your teacher profile details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                {...register("fullName")}
                id="fullName"
                placeholder="Your full name"
                required
              />
              {errors.fullName && (
                <p className="text-xs text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                {...register("phoneNumber")}
                id="phoneNumber"
                placeholder="e.g., +2348012345678"
                required
              />
              {errors.phoneNumber && (
                <p className="text-xs text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                {...register("address")}
                id="address"
                placeholder="Your address"
              />
            </div>

            {/* Highest Degree */}
            <div className="grid gap-2">
              <Label htmlFor="highestDegree">Highest Degree</Label>
              <Input {...register("highestDegree")} id="highestDegree" />
            </div>

            {/* Certifications */}
            <div className="grid gap-2">
              <Label htmlFor="certifications">
                Certifications (comma separated)
              </Label>
              <Input {...register("certifications")} id="certifications" />
            </div>

            {/* Experience Years */}
            <div className="grid gap-2">
              <Label htmlFor="experienceYears">Years of Experience</Label>
              <Input
                type="number"
                {...register("experienceYears")}
                id="experienceYears"
                placeholder="e.g., 5"
                min={0}
              />
              {errors.experienceYears && (
                <p className="text-xs text-red-500">
                  {errors.experienceYears.message}
                </p>
              )}
            </div>

            {/* Languages */}
            <div className="grid gap-2">
              <Label htmlFor="languages">Languages (comma separated)</Label>
              <Input {...register("languages")} id="languages" />
            </div>

            {/* Technical Skills */}
            <div className="grid gap-2">
              <Label htmlFor="techSkills">
                Technical Skills (comma separated)
              </Label>
              <Input {...register("techSkills")} id="techSkills" />
            </div>

            {/* Bio */}
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Input {...register("bio")} id="bio" />
            </div>

            <Button
              type="submit"
              className="w-full bg-p1-hex text-white hover:bg-opacity-90 transition-colors font-semibold cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Profile"}
            </Button>

            {err && <p className="text-red-500 text-center text-sm">{err}</p>}


          </form>
        </CardContent>
      </Card>
    </div>
  );
}
