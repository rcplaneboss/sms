
import { NextResponse } from "next/server";
import { auth } from "@/auth"; // import from your auth.ts setup

export default async function middleware(req: Request) {
  const session = await auth();

  const url = new URL(req.url);
  const pathname = url.pathname;

  const role = session?.user?.role;

  // Not logged in
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect student routes
  if (pathname.startsWith("/(student)") && role !== "student") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect teacher routes
  if (pathname.startsWith("/(teacher)") && role !== "teacher") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect admin routes
  if (pathname.startsWith("/(admin)") && role !== "admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/(student)/:path*",
    "/(teacher)/:path*",
    "/(admin)/:path*",
  ],
};
