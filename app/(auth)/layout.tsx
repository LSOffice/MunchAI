"use client";

import AuthProvider from "@/app/AuthProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {/* Hide navbar for auth routes */}
      <style jsx global>{`
        nav {
          display: none !important;
        }
      `}</style>
      {children}
    </AuthProvider>
  );
}
