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
import { AccountInput, UserSchema } from "@/prisma/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function TeacherAccountForm({
  className,
  setIsAccountRegSucc,
  setUserId,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AccountInput>({
    mode: "onBlur",
    resolver: zodResolver(UserSchema),
  });

  const onSubmit = async (data: AccountInput) => {
    setServerError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key as keyof AccountInput] as string);
    });

    try {
      const response = await fetch("/api/apply/teacher?type=account", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle known errors
        if (result.error) {
          setServerError(result.error);
        } else if (result.details) {
          setServerError("Please fix the highlighted errors and try again.");
        } else {
          setServerError("Something went wrong. Please try again.");
        }
        return;
      }

      // Success 🎉
      setUserId(result.user.id);
      setIsAccountRegSucc(true);
      setSuccessMessage(result.message || "Account created successfully!");
      reset();
    } catch (error: any) {
      setServerError(error.message || "Something went wrong");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-sans text-p1-hex">
            Create an Account
          </CardTitle>
          <CardDescription className="text-sm font-mono text-t-dark dark:text-t-light">
            Fill in the form below to get started as a teacher
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                {...register("username")}
                id="username"
                placeholder="Enter your username"
                className="focus:ring-2 focus:ring-p1-hex"
              />
              {errors.username && (
                <p className="text-xs text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email")}
                id="email"
                type="email"
                placeholder="m@example.com"
                className="focus:ring-2 focus:ring-p1-hex"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                {...register("password")}
                id="password"
                type="password"
                placeholder="Enter password"
                className="focus:ring-2 focus:ring-p1-hex"
              />
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="grid gap-2">
              <Label htmlFor="cPassword">Confirm Password</Label>
              <Input
                {...register("cPassword")}
                id="cPassword"
                type="password"
                placeholder="Confirm password"
                className="focus:ring-2 focus:ring-p1-hex"
              />
              {errors.cPassword && (
                <p className="text-xs text-red-500">
                  {errors.cPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-p1-hex text-white hover:bg-opacity-90 transition-colors font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Sign up"}
            </Button>

            {/* Error / Success Feedback */}
            {serverError && (
              <p className="text-red-500 text-center text-sm mt-2">
                {serverError}
              </p>
            )}
            {successMessage && (
              <p className="text-green-600 text-center text-sm mt-2">
                {successMessage}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-xs font-mono text-t-dark dark:text-t-light">
        Already have an account?{" "}
        <a
          href="#"
          className="underline underline-offset-4 hover:text-p1-hex transition-colors"
        >
          Sign in
        </a>
      </div>
      <div className="text-center text-xs font-mono text-muted-foreground">
        By signing up, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-p1-hex">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-p1-hex">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
