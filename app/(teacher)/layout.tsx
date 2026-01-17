"use client";

import type { Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const MontserratSans = Montserrat({
  variable: "--font-montserrat-sans",
  subsets: ["latin"],
});

const PoppinsSans = Poppins({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-poppins-sans",
  subsets: ["latin"],
});

function TeacherLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = window?.location?.pathname;

  useEffect(() => {
    if (status === "loading") return;
    if (pathname === "/teacher-onboard") return; // Don't redirect if already on onboard page
    
    if (session?.user?.role === "TEACHER") {
      fetch("/api/teacher/profile")
        .then(res => res.json())
        .then(data => {
          if (data.teacherProfile && !data.teacherProfile.acceptedTerms) {
            window?.location?.replace("/teacher-onboard");
          }
        })
        .catch(console.error);
    }
  }, [session, status, pathname]);

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${MontserratSans.variable} ${PoppinsSans.variable} antialiased overflow-x-hidden`}
      >
        <SessionProvider>
          <TeacherLayoutContent>{children}</TeacherLayoutContent>
        </SessionProvider>
      </body>
    </html>
  );
}
