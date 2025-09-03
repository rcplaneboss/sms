"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()

  // 👇 Catch error query string from NextAuth
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "CredentialsSignin":
          setError("Invalid email or password")
          break
        case "NO_ACCOUNT":
          setError("No account found for this Google account. Please register first.")
          break
        case "OAUTH_NOT_LINKED":
          setError("This Google account is not linked. Please login with email and password, then link Google in your profile.")
          break
        default:
          setError("Something went wrong. Please try again.")
      }
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Invalid email or password")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold font-sans text-p1-hex">
          Login to your account
        </h1>
        <p className="text-muted-foreground text-balance font-mono text-xs">
          Enter your email below to login to your account
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email" className="font-mono">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password" className="font-mono">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-p1-hex text-white cursor-pointer"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>

        {/* Google login button */}
        <Button
          variant="outline"
          className="w-full cursor-pointer"
          type="button"
          onClick={() => signIn("google")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="mr-2 h-5 w-5"
          >
            <path
              fill="#4285F4"
              d="M24 9.5c3.54 0 6.71 1.23 9.22 3.63l6.85-6.85C35.63 2.88 30.18 0 24 0 14.72 0 6.77 5.64 2.67 13.82l7.98 6.19C12.27 13.19 17.65 9.5 24 9.5z"
            />
            <path
              fill="#34A853"
              d="M46.14 24.59c0-1.55-.14-3.05-.39-4.5H24v9h12.57c-.54 2.86-2.15 5.29-4.55 6.93l7.02 5.44c4.1-3.78 7.1-9.36 7.1-16.87z"
            />
            <path
              fill="#FBBC05"
              d="M10.65 28.62c-1.11-3.26-1.11-6.98 0-10.24l-7.98-6.19c-3.44 6.85-3.44 15.77 0 22.62l7.98-6.19z"
            />
            <path
              fill="#EA4335"
              d="M24 48c6.18 0 11.36-2.03 15.15-5.53l-7.02-5.44c-2.07 1.38-4.72 2.2-8.13 2.2-6.35 0-11.73-3.69-14.35-8.94l-7.98 6.19C6.77 42.36 14.72 48 24 48z"
            />
          </svg>
          Login with Google
        </Button>
      </div>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/register" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  )
}
