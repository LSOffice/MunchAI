"use client";
import { FormEvent, useEffect, useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function base64URLStringToBuffer(base64URLString: string) {
  const base64 = base64URLString.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64.padEnd(base64.length + padLen, "=");
  const binary = atob(padded);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer;
}

function bufferToBase64URLString(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "auth" | "waiting">("email");
  const [resendTimer, setResendTimer] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const search = useSearchParams();

  useEffect(() => {
    // Check for auth error from API 401 redirect
    const authError = sessionStorage.getItem("authError");
    if (authError) {
      setError(authError);
      sessionStorage.removeItem("authError");
    }

    // Magic link completion moved to /magic-link page; only handle passkey logins here.
  }, [search]);

  // Verify email exists in the system
  const verifyEmail = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data?.error?.message || "Email not found. Please sign up first.",
        );
        setLoading(false);
        return;
      }

      const data = await res.json();
      setEmailVerified(true);
      setHasPasskey(data.hasPasskey || false);

      // If user has passkey, auto-prompt it
      if (data.hasPasskey) {
        setTimeout(() => {
          signInWithPasskey();
        }, 500);
      } else {
        setStep("auth");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to verify email");
    } finally {
      setLoading(false);
    }
  };

  const signInWithPasskey = async () => {
    try {
      setLoading(true);
      setError(null);
      const start = await fetch(
        "/api/auth/passkey/generate-authentication-options",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      if (!start.ok) throw new Error("Failed to start passkey");
      const resp = await start.json();
      const options = resp.data || resp;

      // Convert base64url strings to Buffers
      options.challenge = base64URLStringToBuffer(options.challenge);
      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map(
          (cred: any) => ({
            ...cred,
            id: base64URLStringToBuffer(cred.id),
          }),
        );
      }

      // @ts-ignore - using WebAuthn browser API
      const cred: PublicKeyCredential = await navigator.credentials.get({
        publicKey: options,
      });
      const response = {
        id: cred.id,
        rawId: bufferToBase64URLString(cred.rawId),
        type: cred.type,
        response: {
          clientDataJSON: bufferToBase64URLString(
            (cred.response as AuthenticatorAssertionResponse).clientDataJSON,
          ),
          authenticatorData: bufferToBase64URLString(
            (cred.response as AuthenticatorAssertionResponse).authenticatorData,
          ),
          signature: bufferToBase64URLString(
            (cred.response as AuthenticatorAssertionResponse).signature,
          ),
          userHandle: (cred.response as AuthenticatorAssertionResponse)
            .userHandle
            ? bufferToBase64URLString(
                (cred.response as AuthenticatorAssertionResponse).userHandle!,
              )
            : undefined,
        },
        clientExtensionResults:
          (cred.getClientExtensionResults &&
            cred.getClientExtensionResults()) ||
          {},
        authenticatorAttachment: cred.authenticatorAttachment,
      };
      const verify = await fetch("/api/auth/passkey/verify-authentication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          credential: response,
        }),
      });
      if (!verify.ok) throw new Error("Passkey verification failed");
      const { loginToken } = await verify.json();
      await signIn("credentials", {
        loginToken,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } catch (err: any) {
      setError(err?.message || "Passkey sign-in failed");
      setLoading(false);
    }
  };

  // Handle sending the magic link and move to waiting state
  const sendMagicLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/magic-link/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || "Failed to send magic link");
      }
      const data = await res.json();
      if (data.data?.requestId) {
        setRequestId(data.data.requestId);
      }
      // Transition to waiting state and start resend timer
      setStep("waiting");
      setResendTimer(30);
    } catch (err: any) {
      setError(err?.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  // Countdown for resend button
  useEffect(() => {
    if (step !== "waiting" || resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, resendTimer]);

  // Poll for magic link verification every 2 seconds while on waiting page
  useEffect(() => {
    if (step !== "waiting" || !requestId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/auth/magic-link/poll?requestId=${requestId}`,
        );
        const data = await res.json();

        if (data.data?.success && data.data?.token) {
          // Magic link clicked! Sign in and redirect to dashboard
          setLoading(true);
          clearInterval(pollInterval); // Stop polling immediately
          await signIn("credentials", {
            loginToken: data.data.token,
            redirect: true,
            callbackUrl: "/dashboard",
          });
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [step, requestId]);

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
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {step === "email"
              ? "Sign in to your MunchAI account"
              : `Signing in as ${email}`}
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

          {/* Step 1: Email Verification */}
          {step === "email" && (
            <form onSubmit={verifyEmail} className="space-y-5">
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
                    Verifying email...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          )}

          {/* Step 2: Authentication Options */}
          {step === "auth" && (
            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  Choose your authentication method
                </p>
              </div>

              {!hasPasskey && (
                <>
                  <button
                    onClick={sendMagicLink}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg"
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
                        Sending link...
                      </span>
                    ) : (
                      "📧 Send Magic Link"
                    )}
                  </button>

                  <button
                    onClick={signInWithPasskey}
                    disabled={loading}
                    className="w-full border-2 border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 font-semibold py-3 rounded-lg transition-all"
                  >
                    🔐 Use Passkey
                  </button>
                </>
              )}

              {hasPasskey && (
                <button
                  onClick={signInWithPasskey}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg"
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
                      Using passkey...
                    </span>
                  ) : (
                    "🔐 Use Passkey"
                  )}
                </button>
              )}

              <button
                onClick={() => {
                  setStep("email");
                  setError(null);
                  setEmailVerified(false);
                }}
                className="w-full text-center px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all"
              >
                ← Use Different Email
              </button>
            </div>
          )}

          {/* Step 3: Waiting for Magic Link */}
          {step === "waiting" && (
            <div className="space-y-6">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10">
                  <span className="text-lg">📧</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                    Magic link sent
                  </p>
                  <p className="mt-1 text-xs text-orange-700/80 dark:text-orange-300/70">
                    We've emailed a secure sign-in link to {email}. Click it in
                    the next 15 minutes to finish signing in.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </span>
                Waiting for you to click the link...
              </div>
              <button
                onClick={sendMagicLink}
                disabled={loading || resendTimer > 0}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg"
              >
                {loading
                  ? "Sending..."
                  : resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend Magic Link"}
              </button>
              <button
                onClick={() => {
                  setStep("email");
                  setEmailVerified(false);
                  setError(null);
                  setResendTimer(0);
                }}
                className="w-full text-center px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all"
              >
                ← Use Different Email
              </button>
            </div>
          )}

          {/* Divider */}
          {step === "email" && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Don't have an account?
                  </span>
                </div>
              </div>

              {/* Register Link */}
              <Link
                href="/register"
                className="w-full block text-center px-4 py-3 rounded-lg border-2 border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 font-semibold transition-all"
              >
                Create Account
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          By signing in, you agree to our{" "}
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
            Privacy
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto text-orange-500 animate-spin"
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
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
