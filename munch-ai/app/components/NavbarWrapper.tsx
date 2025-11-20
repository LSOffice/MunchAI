"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import LandingNavbar from "./LandingNavbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const hideNavbar = pathname === "/onboarding";
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  if (hideNavbar) {
    return null;
  }

  return isAuthed ? <Navbar /> : <LandingNavbar />;
}
