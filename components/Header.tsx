"use client";

import React, { useState } from "react";
import { FiFacebook, FiInstagram, FiTwitter } from "react-icons/fi";
import { MdMail, MdPhone } from "react-icons/md";
import { Menu } from "lucide-react";
import { RoleNav } from "./ui/Navigation";
import { Button } from "./ui/LinkAsButton";
import { DarkModeToggle } from "./ui/switch-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { publicNav, studentNav, teacherNav, adminNav } from "@/lib/navConfig";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const { data: session } = useSession();
  const role = session?.user?.role.toLowerCase();

  let items = publicNav;
  if (role === "student") items = studentNav;
  if (role === "teacher") items = teacherNav;
  if (role === "admin") items = adminNav;

  // Split the links for the "More" button functionality
  const visibleItems = items.slice(0, 5);
  const hiddenItems = items.slice(5);

  return (
    <main className="flex flex-col w-full sticky top-0 z-50">
      {/* Dark mode toggle bar */}
      <DarkModeToggle />
      <div className="bg-p1-hex px-30 w-screen flex font-mono text-t-light h-10 max-md:px-8">
        <div className="flex justify-between w-full">
          <div className="flex gap-3 items-center">
            <div className="text-xs flex items-center gap-1">
              <MdPhone />
              +234-70-855-440-64
            </div>
            <div className="text-xs flex items-center gap-1 max-md:hidden">
              <MdMail />
              alitqanonlineschool3@gmail.com
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full w-7 h-7 bg-p1-hex border-2 border-gray-400 flex items-center justify-center hover:bg-gray-400 transition-colors duration-200 cursor-pointer">
              <FiFacebook className="text-white transition-colors duration-200" />
            </div>
            <div className="rounded-full w-7 h-7 bg-p1-hex border-2 border-gray-400 flex items-center justify-center hover:bg-gray-400 transition-colors duration-200 cursor-pointer">
              <FiInstagram className="text-white transition-colors duration-200" />
            </div>
            <div className="rounded-full w-7 h-7 bg-p1-hex border-2 border-gray-400 flex items-center justify-center hover:bg-gray-400 transition-colors duration-200 cursor-pointer">
              <FiTwitter className="text-white transition-colors duration-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="w-full bg-white h-16 px-30 max-md:px-8 flex justify-center items-center dark:bg-black max-md:pl-24">
        <div className="flex justify-between w-full items-center">
          {/* Logo */}
          <div>
            <h1 className="text-2xl font-bold font-sans">Al-Itqan</h1>
          </div>

          {/* Desktop Nav */}
          <div className="font-mono text-t-dark dark:text-t-light text-sm max-md:hidden flex items-center gap-4">
            <RoleNav items={visibleItems} />
            {hiddenItems.length > 0 && (
              <div className="relative">
                <Button
                  onClick={() => setShowMore(!showMore)}
                  variant="ghost"
                  className="flex items-center gap-1 text-sm font-medium"
                >
                  More <Menu className="h-4 w-4" />
                </Button>
                {showMore && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden">
                    <nav className="flex flex-col py-2">
                      {hiddenItems.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                          onClick={() => {
                            setShowMore(false);
                            setOpen(false);
                          }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>

          {session?.user?.id && (
            <Button
              variant="primary"
              size="md"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="max-md:hidden cursor-pointer"
            >
              Log out
            </Button>
          )}

          {/* Desktop Contact Button */}
          {role !== "admin" && (
            <Button
              href="/about"
              variant="primary"
              className="mt-4 max-md:hidden"
            >
              Contact Us
            </Button>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded-md border border-gray-300 dark:border-gray-600">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle>Al-Itqan</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-4 px-6">
                  {items.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-base font-medium text-slate-700 dark:text-slate-200 hover:underline"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {session?.user?.id && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="max-md:hidden cursor-pointer"
                    >
                      Log out
                    </Button>
                  )}

                  {role !== "admin" && (
                    <Button href="/about" variant="primary" className="mt-4">
                      Contact Us
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Header;