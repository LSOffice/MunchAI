"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/utils";

const DIETARY_OPTIONS = [
  { id: "vegan", label: "🌱 Vegan", emoji: "🌱" },
  { id: "vegetarian", label: "🥗 Vegetarian", emoji: "🥗" },
  { id: "gluten-free", label: "🌾 Gluten-Free", emoji: "🌾" },
  { id: "dairy-free", label: "🥛 Dairy-Free", emoji: "🥛" },
  { id: "keto", label: "🥓 Keto", emoji: "🥓" },
  { id: "paleo", label: "🍖 Paleo", emoji: "🍖" },
];

const ALLERGY_OPTIONS = [
  { id: "peanuts", label: "🥜 Peanuts", emoji: "🥜" },
  { id: "tree-nuts", label: "🌳 Tree Nuts", emoji: "🌳" },
  { id: "shellfish", label: "🦐 Shellfish", emoji: "🦐" },
  { id: "soy", label: "🫘 Soy", emoji: "🫘" },
  { id: "dairy", label: "🧀 Dairy", emoji: "🧀" },
  { id: "eggs", label: "🥚 Eggs", emoji: "🥚" },
  { id: "fish", label: "🐠 Fish", emoji: "🐠" },
  { id: "sesame", label: "Sesame", emoji: "🌱" },
];

const CUISINE_OPTIONS = [
  { id: "italian", label: "🇮🇹 Italian", emoji: "🇮🇹" },
  { id: "asian", label: "🥢 Asian", emoji: "🥢" },
  { id: "mexican", label: "🌮 Mexican", emoji: "🌮" },
  { id: "french", label: "🇫🇷 French", emoji: "🇫🇷" },
  { id: "indian", label: "🍛 Indian", emoji: "🍛" },
  { id: "mediterranean", label: "🫒 Mediterranean", emoji: "🫒" },
  { id: "american", label: "🍔 American", emoji: "🍔" },
  { id: "thai", label: "🌶️ Thai", emoji: "🌶️" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dietary, setDietary] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);

  const toggleSelection = (
    value: string,
    state: string[],
    setState: (state: string[]) => void,
    maxSelections?: number,
  ) => {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      if (maxSelections && state.length >= maxSelections) {
        return;
      }
      setState([...state, value]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch("/api/user/profile", {
        method: "PATCH",
        body: {
          dietaryRestrictions: dietary,
          allergies,
          cuisinePreferences: cuisines,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      // Show loading animation for 3 seconds, then redirect
      setSetupComplete(true);

      // Wait for loading animation and let session update
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Refresh session to ensure NavbarWrapper updates
      await updateSession();

      // Small delay to ensure session is synced
      await new Promise((resolve) => setTimeout(resolve, 500));

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const canProceedToStep2 = true; // Dietary restrictions are optional
  const canProceedToStep3 = true; // Allergies are optional
  const canSubmit = cuisines.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse hidden md:block"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse hidden md:block"></div>

      {/* Loading Animation Overlay */}
      {setupComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="text-center space-y-8">
            {/* Animated cooking pot */}
            <div className="relative w-24 h-24 mx-auto">
              <svg
                className="w-24 h-24 mx-auto"
                viewBox="0 0 100 100"
                fill="none"
              >
                {/* Pot */}
                <path
                  d="M 20 50 Q 20 70 35 75 L 65 75 Q 80 70 80 50"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-orange-600 dark:text-orange-400"
                />
                <line
                  x1="25"
                  y1="75"
                  x2="20"
                  y2="85"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-orange-600 dark:text-orange-400"
                />
                <line
                  x1="75"
                  y1="75"
                  x2="80"
                  y2="85"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-orange-600 dark:text-orange-400"
                />

                {/* Animated steam */}
                <circle
                  cx="35"
                  cy="40"
                  r="3"
                  fill="currentColor"
                  className="text-orange-500 dark:text-orange-300 animate-bounce"
                  style={{ animationDelay: "0s" }}
                />
                <circle
                  cx="50"
                  cy="35"
                  r="3"
                  fill="currentColor"
                  className="text-orange-500 dark:text-orange-300 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <circle
                  cx="65"
                  cy="40"
                  r="3"
                  fill="currentColor"
                  className="text-orange-500 dark:text-orange-300 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </svg>

              {/* Rotating ring */}
              <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 border-r-orange-500 rounded-full animate-spin dark:border-t-orange-400 dark:border-r-orange-400"></div>
            </div>

            {/* Progress text */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Setting Up Your Account
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Preparing your personalized experience...
              </p>

              {/* Animated progress bar */}
              <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden mt-6">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full animate-pulse"
                  style={{
                    animation: "progress 3s ease-in-out forwards",
                  }}
                ></div>
              </div>
            </div>

            {/* Floating steps */}
            <div className="flex justify-center gap-4 mt-8">
              {[
                { label: "Saved", delay: "0s" },
                { label: "Personalizing", delay: "0.5s" },
                { label: "Ready", delay: "1s" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 animate-pulse"
                  style={{ animationDelay: item.delay }}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                      {idx + 1}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Add keyframe animation */}
          <style>{`
            @keyframes progress {
              0% {
                width: 0%;
              }
              100% {
                width: 100%;
              }
            }
          `}</style>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
                <span className="text-lg font-bold text-white">M</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Let's Personalize Your Experience
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Tell us about your food preferences so we can recommend better
              recipes
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s <= step
                    ? "w-8 bg-orange-500"
                    : "w-2 bg-gray-300 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
            {/* Step 1: Dietary Restrictions */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Dietary Restrictions
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select any dietary preferences that apply to you (optional)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DIETARY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() =>
                        toggleSelection(option.id, dietary, setDietary)
                      }
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        dietary.includes(option.id)
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <span
                          className={`font-medium ${
                            dietary.includes(option.id)
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {option.label.split(" ").slice(1).join(" ")}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Allergies */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Allergies & Intolerances
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select any allergies or intolerances (optional)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ALLERGY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() =>
                        toggleSelection(option.id, allergies, setAllergies)
                      }
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        allergies.includes(option.id)
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <span
                          className={`font-medium ${
                            allergies.includes(option.id)
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {option.label.split(" ").slice(1).join(" ")}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Cuisine Preferences */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Favorite Cuisines
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select cuisines you love (choose at least one)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CUISINE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() =>
                        toggleSelection(option.id, cuisines, setCuisines)
                      }
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        cuisines.includes(option.id)
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <span
                          className={`font-medium ${
                            cuisines.includes(option.id)
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {option.label.split(" ").slice(1).join(" ")}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {!canSubmit && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Please select at least one cuisine
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mt-6">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 font-semibold transition-all"
              >
                ← Back
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedToStep2) ||
                  (step === 2 && !canProceedToStep3)
                }
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
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
                    Finishing Setup...
                  </span>
                ) : (
                  "Complete Setup →"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
