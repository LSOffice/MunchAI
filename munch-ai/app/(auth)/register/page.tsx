"use client";
import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "verify" | "verifying">("form");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showingVerificationPage, setShowingVerificationPage] = useState(false);

  // Check for token and email in URL params - show thank you message and verify
  useEffect(() => {
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (token && emailParam) {
      setShowingVerificationPage(true);

      // Verify the token immediately
      const verifyToken = async () => {
        try {
          const res = await fetch(
            `/api/auth/verify-registration?token=${token}&email=${encodeURIComponent(emailParam)}`,
          );
          console.log("Token verification response status:", res.status);
          const data = await res.json();
          console.log("Token verification response:", data);
        } catch (err) {
          console.error("Token verification error:", err);
        }
      };

      verifyToken();

      // Show thank you message for 5 seconds then close this window/tab
      const timer = setTimeout(() => {
        window.close();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Poll for verification every 2 seconds while on verify page
  useEffect(() => {
    if (step !== "verify" || !email) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/auth/verify-email?email=${encodeURIComponent(email)}`,
        );
        const data = await res.json();
        console.log("Poll response:", data);

        if (data.data?.verified) {
          console.log("Verification detected, getting login token...");
          // Verification detected, auto-login and redirect
          setStep("verifying");
          const loginRes = await fetch(
            `/api/auth/verify-registration?token=verified&email=${encodeURIComponent(email)}`,
          );
          const loginData = await loginRes.json();
          console.log("Login response:", loginData);

          if (loginData.data?.loginToken) {
            console.log("Got login token, signing in...");
            // Sign in with the login token
            const signInResult = await signIn("credentials", {
              loginToken: loginData.data.loginToken,
              redirect: false,
            });

            console.log("Sign in result:", signInResult);
            console.log("Sign in ok:", signInResult?.ok);
            console.log("Sign in error:", signInResult?.error);
            console.log("Sign in status:", signInResult?.status);
            if (signInResult?.ok) {
              // Wait a moment for session to be established
              console.log("Waiting for session to be established...");
              await new Promise((resolve) => setTimeout(resolve, 2000));
              // Redirect to onboarding
              console.log("Redirecting to onboarding...");
              router.push("/onboarding");
            } else {
              console.error("Sign in failed:", signInResult);
              setError(
                "Failed to sign in automatically. Please try logging in manually.",
              );
              setStep("verify");
            }
          } else {
            console.log("No login token in response");
            setError("Failed to get login token");
            setStep("verify");
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [step, email, router]);

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
        {/* Thank You Message - shown when verification link is clicked */}
        {showingVerificationPage ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Thank you!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your account has been verified successfully.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              You can now close this window and return to the registration page
              where you'll be automatically logged in and redirected.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-6">
              This window will close automatically in a few seconds...
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
                  <span className="text-lg font-bold text-white">M</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {step === "form"
                  ? "Get Started"
                  : step === "verifying"
                    ? "Almost there..."
                    : "Verify Your Email"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {step === "form"
                  ? "Create your MunchAI account today"
                  : step === "verifying"
                    ? "Verifying your email..."
                    : `We sent a verification link to ${email}`}
              </p>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
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
              {(step === "verify" || step === "verifying") && (
                <div className="space-y-6">
                  {step === "verifying" && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                      <div className="flex gap-3">
                        <div className="animate-spin text-2xl">⚙️</div>
                        <div>
                          <p className="text-sm font-medium text-green-900 dark:text-green-400">
                            Verifying your email...
                          </p>
                          <p className="text-xs text-green-800 dark:text-green-300 mt-1">
                            Setting up your account
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === "verify" && (
                    <>
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                        <div className="flex gap-3">
                          <div className="text-2xl">📧</div>
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-400">
                              Check your email
                            </p>
                            <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                              We sent a verification link to{" "}
                              <strong>{email}</strong>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        <p>1. Open the email from MunchAI</p>
                        <p>2. Click the verification link</p>
                        <p>
                          3. You'll be automatically logged in and redirected
                        </p>
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
                    </>
                  )}
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
          </>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
