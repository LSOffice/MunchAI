"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import LandingNavbar from "./LandingNavbar";

export default function NavbarWrapper({ session }: { session: boolean }) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/onboarding";

  if (hideNavbar) {
    return null;
  }

  return session ? <Navbar /> : <LandingNavbar />;
}
