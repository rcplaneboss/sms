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
  const [err, setErr] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountInput>({ mode: "all", resolver: zodResolver(UserSchema) });

  const onSubmit = async (data: AccountInput) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key as keyof AccountInput] as string);
    });

    try {
      const response = await fetch("/api/apply/teacher?type=account", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUserId((await response.json()).user.id);
        setIsAccountRegSucc(true);
      }

      response.json().then((data) => {
        if (data.message) {
          setErr(data.message);
        }
      });
    } catch (error: any) {
      setErr(error.message || "Something went wrong");
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
            Fill in the form below to create an Account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <form onClick={() => signIn("google", { redirectTo: "/register?registered=true" })}>
            <div className="flex flex-col gap-4">
              <Button variant="outline" className="w-full" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Sign up with Google
              </Button>
            </div>
          </form> */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username */}
            <div className="grid gap-2">
              <Label
                htmlFor="username"
                className="text-sm font-semibold text-t-dark dark:text-t-light"
              >
                Username
              </Label>
              <Input
                {...register("username")}
                id="username"
                type="text"
                placeholder="Enter your username"
                className="focus:ring-2 focus:ring-p1-hex"
                required
              />
              {errors.username && (
                <p className="text-xs text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-t-dark dark:text-t-light"
              >
                Email
              </Label>
              <Input
                {...register("email")}
                id="email"
                type="email"
                placeholder="m@example.com"
                className="focus:ring-2 focus:ring-p1-hex"
                required
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-t-dark dark:text-t-light"
              >
                Password
              </Label>
              <Input
                {...register("password")}
                id="password"
                type="password"
                placeholder="Enter password"
                className="focus:ring-2 focus:ring-p1-hex"
                required
              />
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="grid gap-2">
              <Label
                htmlFor="cPassword"
                className="text-sm font-semibold text-t-dark dark:text-t-light"
              >
                Confirm Password
              </Label>
              <Input
                {...register("cPassword")}
                id="cPassword"
                type="password"
                placeholder="Confirm password"
                className="focus:ring-2 focus:ring-p1-hex"
                required
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
              className="w-full bg-p1-hex text-white hover:bg-opacity-90 transition-colors font-semibold cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing up..." : "Sign up"}
            </Button>

            {/* Error Message */}
            {err && <p className="text-red-500 text-center text-sm">{err}</p>}
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
