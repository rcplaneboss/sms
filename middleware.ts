// middleware.ts
import { NextResponse } from 'next/server';
import { auth } from './auth'; // Assuming your auth.ts file is at the root

// Define protected routes and the roles that can access them
const roleBasedAccess = {
  admin: ['/admin-dashboard', '/approvals', '/assignments', '/exams', '/pricing', '/adverts', '/reports', '/settings', '/programs'],
  teacher: ['/teacher-dashboard', '/classes', '/exams', '/grading'],
  student: ['/student-dashboard', '/exams', '/exams/', '/results', '/payments', "/programs/apply"],
};

// Define public paths that anyone can access, authenticated or not
const publicPaths = ['/', '/about', '/pricing', '/vacancy', '/login', '/register', "/programs", "/about", "/contact", "/apply-teacher", "/vacancy/[id]"];

// Use the `auth` handler directly as the middleware
export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;

  const user = req.auth;

  // Case 1: Handle Public Paths
  // If the user is authenticated and on a public page, redirect them to their dashboard
  if (publicPaths.includes(pathname)) {
    if (user) {
      const userRole = user.user?.role as keyof typeof roleBasedAccess;
      const redirectTo = roleBasedAccess[userRole]?.[0];
      if (redirectTo) {
        return NextResponse.redirect(new URL(redirectTo, nextUrl));
      }
    }
    return NextResponse.next();
  }

  // Case 2: Handle Unauthenticated Access
  // If there's no session and the path is not public, redirect to the login page
  if (!user) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Case 3: Handle Role-Based Access Control (RBAC)
  const userRole = user.user?.role as keyof typeof roleBasedAccess;
  const hasAccess = roleBasedAccess[userRole]?.some(route => pathname.startsWith(route));

  // If the user doesn't have access, redirect to an "access denied" page
  if (!hasAccess) {
    return NextResponse.redirect(new URL('/access-denied', nextUrl));
  }

  // If all checks pass, allow the request to continue
  return NextResponse.next();
});

// Configure the matcher to run on all paths except static files and API routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};