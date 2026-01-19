import { NextResponse } from "next/server";
import { auth } from "@/auth-edge"; 

// Define protected routes and the roles that can access them
const roleBasedAccess = {
  admin: [
    "/admin-dashboard",
    "/approvals",
    "/admin/payments",
    "/assignments",
    "/exams",
    "/pricing-list",
    "/set-pricing",
    "/adverts",
    "/reports",
    "/settings",
    "/admin-program",
    "/levels",
    "/tracks",
    "/subjects",
    "/courses",
    "/grade-overview",
    "/user-management",
    "/user-management/new",
    "/terms",
  ],
  teacher: [
    "/teacher-dashboard",
    "/classes",
    "/teacher-exams",
    "/grading",
    "/teacher-onboard",
    "/assigned-courses"
  ],
  student: [
    "/student-dashboard",
    "/exams",
    "/exams/",
    "/my-results",
    "/payments",
    "/programs",
    '/my-exams',
    "/my-reports",
  ],
};

// Define public paths that anyone can access, authenticated or not
const publicPaths = [
  "/",
  "/about",
  "/pricing",
  "/vacancy",
  "/login",
  "/register",
  "/programs",
  "/about",
  "/contact",
  "/apply-teacher",
  "/vacancy/[id]",
  "/access-denied",
];

// Use the `auth` handler directly as the middleware
export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;

  const user = req.auth;

  // Case 0: Always allow API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Case 1: Handle Public Paths
  // Allow everyone to access public pages
  if (publicPaths.includes(pathname) || pathname.startsWith("/vacancy/") || pathname.startsWith("/programs/")) {
    return NextResponse.next();
  }

  // Case 2: Handle Unauthenticated Access
  // If there's no session and the path is not public, redirect to the login page
  if (!user) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Case 3: Handle Role-Based Access Control (RBAC)
  const userRole = user.user?.role as keyof typeof roleBasedAccess;
  
  if (!userRole) {
    return NextResponse.redirect(new URL("/access-denied", nextUrl));
  }

  const normalizedRole = userRole.toLowerCase() as keyof typeof roleBasedAccess;
  const allowedRoutes = roleBasedAccess[normalizedRole];
  
  // Debug logging
  console.log('Middleware check:', { pathname, userRole: normalizedRole, allowedRoutes });
  
  const hasAccess = allowedRoutes?.some((route) => pathname.startsWith(route));
  
  console.log('Access result:', { hasAccess, pathname });

  // If the user doesn't have access, redirect to an "access denied" page
  if (!hasAccess) {
    return NextResponse.redirect(new URL("/access-denied", nextUrl));
  }

  // If all checks pass, allow the request to continue
  return NextResponse.next();
});

// Configure the matcher to run on all paths except static files and API routes
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"
  ],
};
