// components/layout/Footer.tsx
import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 dark:bg-slate-900 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 grid gap-10 md:grid-cols-4">
        {/* Logo / Name */}
        <div>
          <h2 className="text-2xl font-extrabold text-white">Al-Itqan</h2>
          <p className="mt-3 text-sm leading-6">
            Excellence in modern & classical education. Learn anywhere, excel
            everywhere.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-sm font-semibold text-white">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/programs" className="hover:text-white">
                Programs
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-white">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold text-white">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail size={16} /> info@alitqan.com
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> +123 456 789
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-sm font-semibold text-white">Follow Us</h3>
          <div className="mt-4 flex gap-4">
            <Link href="#" className="hover:text-white">
              <Facebook />
            </Link>
            <Link href="#" className="hover:text-white">
              <Twitter />
            </Link>
            <Link href="#" className="hover:text-white">
              <Instagram />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 dark:border-slate-700 py-6 text-center text-sm">
        © {new Date().getFullYear()} Al-Itqan. All rights reserved.
      </div>
    </footer>
  );
}
