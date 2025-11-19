"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [message, setMessage] = useState("Verifying your email...");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verify = async () => {
      try {
        const token = searchParams.get("token");
        const email = searchParams.get("email");

        if (!token || !email) {
          setStatus("error");
          setMessage("Invalid verification link. Missing token or email.");
          return;
        }

        // Call the verify API
        const res = await fetch(
          `/api/auth/verify-registration?token=${token}&email=${encodeURIComponent(email)}`,
        );
        const data = await res.json();

        if (!res.ok || !data.data?.verified) {
          setStatus("error");
          setMessage(
            data.error?.message ||
              "Verification failed. Please try again or contact support.",
          );
          return;
        }

        setStatus("success");
        setMessage("Thanks for verifying!");
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
        console.error("Verification error:", err);
      }
    };

    verify();
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    if (status !== "success") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.close();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse hidden md:block"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse hidden md:block"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
          {status === "verifying" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
                  <span className="text-lg font-bold text-white">M</span>
                </div>
              </div>
              <div className="space-y-4">
                <svg
                  className="w-16 h-16 mx-auto text-orange-500 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.25"
                  ></circle>
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {message}
                </h1>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {message}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Your email has been verified successfully.
                </p>
                <div className="pt-4 space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Go back to the registration page where you'll be
                    automatically logged in.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      Closing window in {countdown}s...
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Verification Failed
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{message}</p>
                <button
                  onClick={() => window.close()}
                  className="mt-6 w-full px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  Close Window
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
