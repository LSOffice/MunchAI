"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { UserProfile } from "../types";
import { apiFetch } from "@/lib/utils";

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

export default function Settings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "account"
  >("profile");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiFetch("/api/user/profile");
        const data = await response.json();
        setProfile(data.data || {});
        setFormData(data.data || {});
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const dietaryOptions = [
    { id: "vegan", label: "vegan", emoji: "🌱" },
    { id: "vegetarian", label: "vegetarian", emoji: "🥗" },
    { id: "gluten-free", label: "gluten-free", emoji: "🌾" },
    { id: "dairy-free", label: "dairy-free", emoji: "🥛" },
    { id: "keto", label: "keto", emoji: "🥓" },
    { id: "paleo", label: "paleo", emoji: "🍖" },
  ];
  const allergyOptions = [
    { id: "peanuts", label: "peanuts", emoji: "🥜" },
    { id: "tree-nuts", label: "tree nuts", emoji: "🌳" },
    { id: "shellfish", label: "shellfish", emoji: "🦐" },
    { id: "fish", label: "fish", emoji: "🐠" },
    { id: "eggs", label: "eggs", emoji: "🥚" },
    { id: "dairy", label: "dairy", emoji: "🧀" },
    { id: "soy", label: "soy", emoji: "🫘" },
  ];
  const cuisineOptions = [
    { id: "italian", label: "italian", emoji: "🇮🇹" },
    { id: "asian", label: "asian", emoji: "🥢" },
    { id: "mediterranean", label: "mediterranean", emoji: "🫒" },
    { id: "mexican", label: "mexican", emoji: "🌮" },
    { id: "indian", label: "indian", emoji: "🍛" },
    { id: "thai", label: "thai", emoji: "🌶️" },
    { id: "greek", label: "greek", emoji: "🏛️" },
    { id: "american", label: "american", emoji: "🍔" },
  ];

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      const response = await apiFetch("/api/user/profile", {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to save profile");

      const data = await response.json();
      setProfile(data.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDietary = (option: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      dietaryRestrictions: formData.dietaryRestrictions?.includes(option)
        ? formData.dietaryRestrictions.filter((d) => d !== option)
        : [...(formData.dietaryRestrictions || []), option],
    });
  };

  const toggleAllergy = (option: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      allergies: formData.allergies?.includes(option)
        ? formData.allergies.filter((a) => a !== option)
        : [...(formData.allergies || []), option],
    });
  };

  const toggleCuisine = (option: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      cuisinePreferences: formData.cuisinePreferences?.includes(option)
        ? formData.cuisinePreferences.filter((c) => c !== option)
        : [...(formData.cuisinePreferences || []), option],
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!profile || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">
          Failed to load profile
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Settings ⚙️
          </h1>
          <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
            Manage your profile and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          <div className="flex gap-4 sm:gap-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-2 sm:pb-3 text-xs sm:text-base font-semibold transition-colors whitespace-nowrap ${
                activeTab === "profile"
                  ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`pb-2 sm:pb-3 text-xs sm:text-base font-semibold transition-colors whitespace-nowrap ${
                activeTab === "preferences"
                  ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Preferences
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`pb-2 sm:pb-3 text-xs sm:text-base font-semibold transition-colors whitespace-nowrap ${
                activeTab === "account"
                  ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Account
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-8 dark:border-gray-800 dark:bg-gray-800">
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
              <div className="h-16 sm:h-24 w-16 sm:w-24 flex-shrink-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-600"></div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {profile.name}
                </h3>
                <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 break-all">
                  {profile.email}
                </p>
                <button className="mt-2 text-xs sm:text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
                  Change avatar →
                </button>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {saveSuccess && (
                <div className="rounded-lg bg-green-100 p-3 sm:p-4 text-xs sm:text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  ✓ Profile updated successfully!
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-orange-500 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50 dark:bg-orange-600 dark:hover:bg-orange-700"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="space-y-4 sm:space-y-8">
            {/* Dietary Restrictions */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-8 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-4 text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                Dietary Restrictions
              </h3>
              <p className="mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Select any dietary restrictions you have. We'll filter recipes
                accordingly.
              </p>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleDietary(option.id)}
                    className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                      (formData.dietaryRestrictions || []).includes(option.id)
                        ? "bg-green-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    <span className="mr-1">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-8 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-4 text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                Allergies
              </h3>
              <p className="mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Select all allergies to keep you safe. Recipes will exclude
                these ingredients.
              </p>
              <div className="flex flex-wrap gap-2">
                {allergyOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleAllergy(option.id)}
                    className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                      (formData.allergies || []).includes(option.id)
                        ? "bg-red-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    <span className="mr-1">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine Preferences */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-8 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-4 text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                Favorite Cuisines
              </h3>
              <p className="mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Select your preferred cuisines to get personalized recipe
                recommendations.
              </p>
              <div className="flex flex-wrap gap-2">
                {cuisineOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleCuisine(option.id)}
                    className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                      (formData.cuisinePreferences || []).includes(option.id)
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    <span className="mr-1">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {saveSuccess && (
              <div className="rounded-lg bg-green-100 p-3 sm:p-4 text-xs sm:text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                ✓ Preferences updated successfully!
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-orange-500 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50 dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-4 sm:space-y-8">
            {/* Password */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-8 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-4 text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                Change Password
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-8 dark:border-gray-800 dark:bg-gray-800">
                  <h3 className="mb-4 text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Passkeys
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Secure, passwordless sign-in. Register a passkey tied to
                    this device.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        const start = await fetch(
                          "/api/auth/passkey/generate-registration-options",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: profile.email }),
                          },
                        );
                        if (!start.ok)
                          throw new Error(
                            "Failed to start passkey registration",
                          );
                        const resp = await start.json();
                        const options = resp.data || resp;

                        // Convert base64url strings to Buffers
                        options.challenge = base64URLStringToBuffer(
                          options.challenge,
                        );
                        options.user.id = base64URLStringToBuffer(
                          options.user.id,
                        );
                        if (options.excludeCredentials) {
                          options.excludeCredentials =
                            options.excludeCredentials.map((cred: any) => ({
                              ...cred,
                              id: base64URLStringToBuffer(cred.id),
                            }));
                        }

                        // @ts-ignore
                        const cred: PublicKeyCredential =
                          await navigator.credentials.create({
                            publicKey: options,
                          });
                        const attResp =
                          cred.response as AuthenticatorAttestationResponse;
                        const credential = {
                          id: cred.id,
                          rawId: bufferToBase64URLString(cred.rawId),
                          type: cred.type,
                          response: {
                            clientDataJSON: bufferToBase64URLString(
                              attResp.clientDataJSON,
                            ),
                            attestationObject: bufferToBase64URLString(
                              attResp.attestationObject,
                            ),
                          },
                          transports: (cred as any).transports || [],
                          clientExtensionResults:
                            cred.getClientExtensionResults(),
                          authenticatorAttachment: cred.authenticatorAttachment,
                        };
                        const verify = await fetch(
                          "/api/auth/passkey/verify-registration",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              email: profile.email,
                              credential,
                            }),
                          },
                        );
                        if (!verify.ok)
                          throw new Error("Passkey verification failed");
                        alert(
                          "Passkey registered! You can now sign in with it.",
                        );
                      } catch (e: any) {
                        alert(e.message || "Passkey registration failed");
                      }
                    }}
                    className="rounded-lg bg-orange-500 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                  >
                    Register Passkey
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 sm:p-8 dark:border-red-900/50 dark:bg-red-900/20">
              <h3 className="mb-2 text-base sm:text-xl font-semibold text-red-900 dark:text-red-400">
                Danger Zone
              </h3>
              <p className="mb-4 text-xs sm:text-sm text-red-800 dark:text-red-300">
                These actions cannot be undone.
              </p>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    await signOut({ redirect: false });
                    router.push("/");
                  }}
                  className="w-full rounded-lg bg-orange-500 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                >
                  Sign Out
                </button>
                <button
                  onClick={async () => {
                    const confirmed = confirm(
                      "Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.",
                    );
                    if (!confirmed) return;

                    try {
                      const response = await apiFetch(
                        "/api/user/delete-account",
                        {
                          method: "DELETE",
                        },
                      );

                      if (!response.ok) {
                        throw new Error("Failed to delete account");
                      }

                      // Sign out and redirect
                      await signOut({ redirect: false });
                      // Reload the page to clear all session data and update navbar
                      window.location.href = "/";
                    } catch (error) {
                      console.error("Failed to delete account:", error);
                      alert("Failed to delete account. Please try again.");
                    }
                  }}
                  className="w-full rounded-lg bg-red-500 px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
