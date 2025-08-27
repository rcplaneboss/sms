"use client";

import React, { useState } from "react";
import { FiFacebook, FiInstagram, FiTwitter } from "react-icons/fi";
import { MdMail, MdPhone } from "react-icons/md";
import { Menu } from "lucide-react";
import { NavigationMenuDemo } from "./ui/Navigation";
import { Button } from "./ui/LinkAsButton";
import { DarkModeToggle } from "./ui/switch-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import Link from "next/link";

const Header = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Programs", href: "/programs" },
    { title: "Pricing", href: "/pricing" },
    { title: "Vacancies", href: "/vacancy" }, 
    { title: "Register", href: "/register" },
    { title: "Apply as Teacher", href: "/apply-teacher" },
    { title: "Login", href: "/login" },
  ];

  return (
    <main className="flex flex-col w-full sticky top-0 z-50">
      {/* Dark mode toggle bar */}
      <DarkModeToggle />
      <div className="bg-p1-hex px-30 w-screen flex font-mono text-t-light h-10 max-md:px-16">
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
      <div className="w-full bg-white h-16 px-30 max-md:px-16 flex justify-center items-center dark:bg-black max-md:pl-24">
        <div className="flex justify-between w-full items-center">
          {/* Logo */}
          <div>
            <h1 className="text-2xl font-bold font-sans">Al-Itqan</h1>
          </div>

          {/* Desktop Nav */}
          <div className="font-mono text-t-dark dark:text-t-light text-sm max-md:hidden">
            <NavigationMenuDemo />
          </div>

          {/* Desktop Contact Button */}
          <div className="max-md:hidden">
            <Button href="/about" variant="primary">
              Contact Us
            </Button>
          </div>

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
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-base font-medium text-slate-700 dark:text-slate-200 hover:underline"
                      onClick={() => setOpen(false)}
                    >
                      {link.title}
                    </Link>
                  ))}
                  <Button href="/about" variant="primary" className="mt-4">
                    Contact Us
                  </Button>
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
