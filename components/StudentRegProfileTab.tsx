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
import { Calendar22 } from "./ui/dropdown-calender";
import { SelectDemo } from "./SelectDropdown";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { ProfileInput, ProfileSchema } from "@/prisma/schema";
import { useRouter } from "next/router";

export function StudentRegProfileTab({
  className,
  userId,
  ...props
}: React.ComponentProps<"div">) {
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    mode: "all",
    resolver: zodResolver(ProfileSchema),
  });

  const onSubmit = async (data: ProfileInput) => {
    try {
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        if (key == "dateOfBirth") {
          formData.append(key, (data[key] as Date).toISOString());
        } else {
          formData.append(key, (data as any)[key]);
        }
      });

      const today = new Date();
      const birthDate = new Date(data.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      formData.append("age", age.toString());
      formData.append("userId", userId);

      const res = await fetch("/api/apply/student?type=profile", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit profile");

      const result = await res.json();
      console.log(result);
      router.push('/login?registered=true');

    } catch (error: any) {
      setErr(error.message || "Something went wrong");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-sans text-p1-hex">
            Essential Details
          </CardTitle>
          <CardDescription className="text-sm font-mono text-t-dark dark:text-t-light">
            You need to enter these personal information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6 md:px-6">
                <div className="flex gap-2 max-md:flex-col w-full justify-between flex-wrap px-0 mx-0">
                  <div className="grid gap-6">
                    {/* Full Name */}
                    <div className="grid gap-3">
                      <Label
                        htmlFor="full-name"
                        className="text-sm font-semibold text-t-dark dark:text-t-light"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="full-name"
                        type="text"
                        placeholder="Abdul Rahman Qosim"
                        {...register("fullName")}
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="grid gap-3">
                      <Label
                        htmlFor="gender"
                        className="text-sm font-semibold text-t-dark dark:text-t-light"
                      >
                        Gender
                      </Label>
                      <Input
                        id="gender"
                        type="text"
                        placeholder="Male/Female"
                        {...register("gender")}
                      />
                      {errors.gender && (
                        <p className="text-red-500 text-sm">
                          {errors.gender.message}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="grid gap-3">
                      <Label
                        htmlFor="date-of-birth"
                        className="text-sm font-semibold text-t-dark dark:text-t-light"
                      >
                        Date of Birth
                      </Label>
                      <Controller
                        control={control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <Calendar22
                            date={field.value}
                            setDate={field.onChange}
                          />
                        )}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-red-500 text-sm">
                          {errors.dateOfBirth.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="grid gap-3">
                      <Label
                        htmlFor="phone-number"
                        className="text-sm font-semibold text-t-dark dark:text-t-light"
                      >
                        Phone Number / WhatsApp Number
                      </Label>
                      <Input
                        id="phone-number"
                        type="text"
                        placeholder="+1234567890"
                        {...register("phoneNumber")}
                      />
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-sm">
                          {errors.phoneNumber.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {/* Address */}
                    <div className="grid gap-3">
                      <Label
                        htmlFor="residential-address"
                        className="text-sm font-semibold text-t-dark dark:text-t-light"
                      >
                        Residential Address (country at minimum)
                      </Label>
                      <Input
                        id="residential-address"
                        type="text"
                        placeholder="123 Main St, City"
                        {...register("address")}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm">
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    {/* Guardian Name */}
                    <div className="grid gap-3">
                      <Label
                        htmlFor="guardian-name"
                        className="text-sm font-semibold text-t-dark dark:text-t-light"
                      >
                        Guardian / Parent's Name
                      </Label>
                      <Input
                        id="guardian-name"
                        type="text"
                        placeholder="John Doe"
                        {...register("guardianName")}
                      />
                      {errors.guardianName && (
                        <p className="text-red-500 text-sm">
                          {errors.guardianName.message}
                        </p>
                      )}
                    </div>

                    {/* Guardian Number */}
                    <div className="grid gap-3">
                      <Label
                        htmlFor="guardian-number"
                        className="text-sm font-semibold text-t-dark dark:text-t-light"
                      >
                        Guardian / Parent's Number
                      </Label>
                      <Input
                        id="guardian-number"
                        type="text"
                        placeholder="+1234567890"
                        {...register("guardianNumber")}
                      />
                      {errors.guardianNumber && (
                        <p className="text-red-500 text-sm">
                          {errors.guardianNumber.message}
                        </p>
                      )}
                    </div>

                    {/* Previous Education */}
                    <div className="grid gap-3">
                      <Label
                        htmlFor="preferred-course"
                        className="text-sm font-semibold text-t-dark dark:text-t-light"
                      >
                        Previous Course / Program
                      </Label>
                      <Controller
                        control={control}
                        name="previousEducation"
                        render={({ field }) => (
                          <SelectDemo
                            items={[
                              { value: "BASIC", label: "Primary/Basic" },
                              {
                                value: "HIGH_SCHOOL",
                                label: "High School/Secondary",
                              },
                              { value: "DEGREE_HOLDER", label: "B.sc" },
                              { value: "MASTER_DEGREE", label: "Master" },
                              { value: "NOVICE", label: "Novice" },
                              { value: "OTHERS", label: "Others" },
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="cursor=pointer w-full bg-p1-hex text-white hover:bg-opacity-90 transition-colors font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>

                {err && (
                  <p className="text-red-500 text-center text-sm mt-2">{err}</p>
                )}
              </div>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="#" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
