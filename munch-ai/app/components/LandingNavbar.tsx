"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <span className="hidden font-semibold text-gray-900 dark:text-white sm:inline">
              MunchAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:gap-1">
            <Link
              href="#features"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Testimonials
            </Link>
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="ml-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t border-gray-200 dark:border-gray-800 md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              <Link
                href="#features"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                How It Works
              </Link>
              <Link
                href="#testimonials"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Testimonials
              </Link>
              <Link
                href="/api/auth/signin"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Log in
              </Link>
              <Link
                href="/api/auth/signup"
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-lg bg-orange-500 px-3 py-2 text-base font-semibold text-white transition hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
