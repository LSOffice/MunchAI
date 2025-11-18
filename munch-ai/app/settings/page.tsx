"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "../types";

export default function Settings() {
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
        const response = await fetch("/api/user/profile");
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
    "vegetarian",
    "vegan",
    "gluten-free",
    "dairy-free",
    "keto",
    "paleo",
  ];
  const allergyOptions = [
    "peanuts",
    "tree nuts",
    "shellfish",
    "fish",
    "eggs",
    "dairy",
    "soy",
  ];
  const cuisineOptions = [
    "Italian",
    "Asian",
    "Mediterranean",
    "Mexican",
    "Indian",
    "Thai",
    "Greek",
    "American",
  ];

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Settings ⚙️
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-3 font-semibold transition-colors ${
                activeTab === "profile"
                  ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`pb-3 font-semibold transition-colors ${
                activeTab === "preferences"
                  ? "border-b-2 border-orange-500 text-orange-600 dark:text-orange-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Preferences
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`pb-3 font-semibold transition-colors ${
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
          <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-800">
            <div className="mb-8 flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600"></div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {profile.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {profile.email}
                </p>
                <button className="mt-2 text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
                  Change avatar →
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {saveSuccess && (
                <div className="rounded-lg bg-green-100 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  ✓ Profile updated successfully!
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50 dark:bg-orange-600 dark:hover:bg-orange-700"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="space-y-8">
            {/* Dietary Restrictions */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Dietary Restrictions
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Select any dietary restrictions you have. We'll filter recipes
                accordingly.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {dietaryOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(formData.dietaryRestrictions || []).includes(
                        option,
                      )}
                      onChange={() => toggleDietary(option)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-600"
                    />
                    <span className="ml-2 capitalize text-gray-700 dark:text-gray-300">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Allergies
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Select all allergies to keep you safe. Recipes will exclude
                these ingredients.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {allergyOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(formData.allergies || []).includes(option)}
                      onChange={() => toggleAllergy(option)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-600"
                    />
                    <span className="ml-2 capitalize text-gray-700 dark:text-gray-300">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cuisine Preferences */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Favorite Cuisines
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Select your preferred cuisines to get personalized recipe
                recommendations.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {cuisineOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(formData.cuisinePreferences || []).includes(
                        option,
                      )}
                      onChange={() => toggleCuisine(option)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-600"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {saveSuccess && (
              <div className="rounded-lg bg-green-100 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                ✓ Preferences updated successfully!
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50 dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-8">
            {/* Password */}
            <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button className="rounded-lg bg-orange-500 px-6 py-2 font-medium text-white transition-colors hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700">
                  Update Password
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-lg border border-red-300 bg-red-50 p-8 dark:border-red-900/50 dark:bg-red-900/20">
              <h3 className="mb-2 text-xl font-semibold text-red-900 dark:text-red-400">
                Danger Zone
              </h3>
              <p className="mb-4 text-sm text-red-800 dark:text-red-300">
                These actions cannot be undone.
              </p>
              <button className="rounded-lg bg-red-500 px-6 py-2 font-medium text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
