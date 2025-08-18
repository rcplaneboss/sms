import type { Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";

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

export const metadata: Metadata = {
  title: "School Management System",
  description: "A comprehensive school management system for efficient administration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${MontserratSans.variable} ${PoppinsSans.variable} antialiased overflow-hidden`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
