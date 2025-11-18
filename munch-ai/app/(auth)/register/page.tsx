"use client";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "verify">("form");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || "Registration failed");
      }

      setStep("verify");
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onResendVerification = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || "Failed to resend email");
      }

      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 sm:px-6 lg:px-8">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse hidden md:block"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse hidden md:block"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
              <span className="text-lg font-bold text-white">M</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {step === "form" ? "Get Started" : "Verify Your Email"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === "form"
              ? "Create your MunchAI account today"
              : `We sent a verification link to ${email}`}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          {step === "form" && (
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-400">
                We'll send you a verification email to confirm your account.
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5 animate-spin"
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
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          {/* Verification Waiting Screen */}
          {step === "verify" && (
            <div className="space-y-6">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                <div className="flex gap-3">
                  <div className="text-2xl">📧</div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-400">
                      Check your email
                    </p>
                    <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                      We sent a verification link to <strong>{email}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>1. Open the email from MunchAI</p>
                <p>2. Click the verification link</p>
                <p>3. Return here and sign in with your account</p>
              </div>

              <div>
                <button
                  onClick={onResendVerification}
                  disabled={resendCooldown > 0 || loading}
                  className="w-full rounded-lg border-2 border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 font-semibold py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Verification Email"}
                </button>
              </div>

              <button
                onClick={() => {
                  setStep("form");
                  setError(null);
                  setName("");
                  setEmail("");
                  setResendCooldown(0);
                }}
                className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Use different email
              </button>
            </div>
          )}

          {/* Divider */}
          {step === "form" && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <Link
                href="/login"
                className="w-full block text-center px-4 py-3 rounded-lg border-2 border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 font-semibold transition-all"
              >
                Sign In
              </Link>
            </>
          )}

          {step === "verify" && (
            <Link
              href="/login"
              className="w-full block text-center px-4 py-3 rounded-lg border-2 border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 font-semibold transition-all"
            >
              Go to Login
            </Link>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-6">
          By creating an account, you agree to our{" "}
          <a
            href="#"
            className="text-orange-600 dark:text-orange-400 hover:underline"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-orange-600 dark:text-orange-400 hover:underline"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
