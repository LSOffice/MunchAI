"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Settings } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/scanner", label: "Scan Receipt" },
    { href: "/inventory", label: "Inventory" },
    { href: "/recipes", label: "Recipes" },
    { href: "/saved", label: "Saved" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <span className="hidden font-semibold text-gray-900 dark:text-white sm:inline">
              MunchAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/settings"
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/settings")
                  ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
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
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block rounded-md px-3 py-2 text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/settings"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium transition-colors ${
                  isActive("/settings")
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
