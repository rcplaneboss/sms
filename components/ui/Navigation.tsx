"use client";

import * as React from "react";
import Link from "next/link";
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

// Main app sections for navigation
const appSections: { title: string; href: string; description: string }[] = [
  {
    title: "About",
    href: "/about",
    description: "Learn more about Al-Itqan Online School and our mission.",
  },
  {
    title: "Pricing",
    href: "/pricing",
    description: "View our pricing plans for students and teachers.",
  },
  {
    title: "Register",
    href: "/register",
    description: "Register as a new student.",
  },
  {
    title: "Apply as Teacher",
    href: "/apply-teacher",
    description: "Apply to become a teacher at Al-Itqan.",
  },
  {
    title: "Login",
    href: "/login",
    description: "Access your account.",
  },
];

export function NavigationMenuDemo() {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] ">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mt-4 mb-2 text-lg font-medium">
                      Al-Itqan Online School
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      Online School for Islamic Excellence and Moral Education.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/about" title="About US">
                Learn more about Al-Itqan Online School and our mission.
              </ListItem>
              <ListItem href="/register" title="Register As a Student">
                Learn more about the registration process for students.
              </ListItem>
              <ListItem href="/apply-teacher" title="Apply as a Teacher">
                Learn more about the application process for teachers.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Sections</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {appSections.map((section) => (
                <ListItem
                  key={section.title}
                  title={section.title}
                  href={section.href}
                >
                  {section.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/profile">Profile</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Student</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              <ListItem href="/student/dashboard" title="Dashboard">
                Student dashboard and overview.
              </ListItem>
              <ListItem href="/student/exams" title="Exams">
                View and take exams.
              </ListItem>
              <ListItem href="/student/results" title="Results">
                View your exam results.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Teacher</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              <ListItem href="/teacher/dashboard" title="Dashboard">
                Teacher dashboard and classes.
              </ListItem>
              <ListItem href="/teacher/exams" title="Exams">
                Manage and create exams.
              </ListItem>
              <ListItem href="/teacher/grading" title="Grading">
                Grade student attempts.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              <ListItem href="/admin/dashboard" title="Dashboard">
                Admin dashboard and reports.
              </ListItem>
              <ListItem href="/admin/approvals" title="Approvals">
                Approve teachers and assignments.
              </ListItem>
              <ListItem href="/admin/settings" title="Settings">
                Manage system settings.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
