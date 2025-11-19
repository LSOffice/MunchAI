"use client";

import { useRouter } from "next/navigation";

const partners = [
  { name: "Whole Foods", emoji: "🛒", color: "text-orange-600" },
  { name: "Instacart", emoji: "🥬", color: "text-green-600" },
  { name: "Earth911", emoji: "🌱", color: "text-blue-600" },
  { name: "Too Good To Go", emoji: "♻️", color: "text-purple-600" },
  { name: "Freshly", emoji: "🍎", color: "text-red-600" },
  { name: "Local Harvest", emoji: "🌾", color: "text-yellow-600" },
  { name: "EPA", emoji: "📊", color: "text-indigo-600" },
  { name: "StartupXYZ", emoji: "🤝", color: "text-teal-600" },
];

export default function HomeClient() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-gray-950 dark:to-gray-900">
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .carousel-container {
          animation: scroll 30s linear infinite;
        }
        .carousel-container:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <section className="w-full max-w-3xl text-center">
          <p className="mb-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
            Welcome to MunchAI
          </p>
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
            Turn your groceries into{" "}
            <span className="text-orange-500">smart meal plans</span>.
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-sm text-gray-600 sm:text-base dark:text-gray-300">
            Scan receipts, track your pantry, and discover AI-powered recipes
            based on what you already have at home.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <button
              onClick={() => router.push("/login")}
              className="w-full rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-500 sm:w-auto"
            >
              Log in
            </button>
            <button
              onClick={() => router.push("/register")}
              className="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 sm:w-auto"
            >
              Sign up
            </button>
          </div>
        </section>

        <section
          className="mt-12 grid w-full max-w-4xl gap-6 md:grid-cols-3"
          id="features"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
              Scan receipts
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Snap a picture of your grocery receipt and let MunchAI extract and
              categorize ingredients for you.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
              Track your inventory
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              See what you have at a glance, with expiration reminders so you
              use things before they go bad.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
              Discover recipes
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Get AI-powered recipe suggestions tailored to your pantry and
              dietary preferences.
            </p>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mt-20 w-full max-w-5xl" id="testimonials">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Loved by home cooks everywhere
            </h2>
            <p className="mb-12 text-gray-600 dark:text-gray-400">
              See what people are saying about MunchAI
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ★
                  </span>
                ))}
              </div>
              <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                "MunchAI has completely changed how I meal plan. No more wasted
                food, and I'm discovering recipes I'd never have thought of!"
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Sarah M.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Busy Parent
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ★
                  </span>
                ))}
              </div>
              <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                "Finally, a smart way to reduce food waste. The AI
                recommendations are surprisingly accurate and delicious."
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                James T.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sustainability Advocate
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ★
                  </span>
                ))}
              </div>
              <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                "The receipt scanner is a game-changer. I spend 2 seconds
                scanning instead of 10 minutes typing out groceries."
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Emma L.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Home Chef
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mt-20 w-full max-w-5xl" id="how-it-works">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              How MunchAI works
            </h2>
            <p className="mb-12 text-gray-600 dark:text-gray-400">
              Get started in just three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600 dark:bg-orange-900/40 dark:text-orange-300 mx-auto">
                1
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Scan & Upload
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Take a photo of your grocery receipt or manually add items to
                your pantry
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600 dark:bg-orange-900/40 dark:text-orange-300 mx-auto">
                2
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Track Your Pantry
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your inventory is organized automatically with expiration dates
                and categories
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600 dark:bg-orange-900/40 dark:text-orange-300 mx-auto">
                3
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                Get AI Recipes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive personalized recipe suggestions based on what you have
              </p>
            </div>
          </div>
        </section>

        {/* Food Waste Reduction Section */}
        <section className="mt-20 w-full max-w-5xl">
          <div className="rounded-3xl bg-red-50 p-8 dark:bg-red-950/20 sm:p-12">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                Fight Food Waste, Save Money
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The average household throws away $1,500 worth of food every
                year. MunchAI helps you reclaim it.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-red-200 bg-white p-6 dark:border-red-900/40 dark:bg-gray-900">
                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                    ⚠️
                  </span>
                  The Problem
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expired foods pile up in your fridge. You forget what you
                  have. You buy duplicates. Food spoils before you can use it.
                  Meanwhile, you're losing money and contributing to
                  environmental waste.
                </p>
              </div>

              <div className="rounded-2xl border border-green-200 bg-white p-6 dark:border-green-900/40 dark:bg-gray-900">
                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                    ✓
                  </span>
                  The Solution
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  MunchAI tracks every item with expiration dates, sends you
                  reminders, and suggests recipes to use items before they
                  spoil. Reduce waste, save money, and help the planet.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="text-center">
                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  By using MunchAI, users save an average of:
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      $50/month
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Less wasted food
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      40% Reduction
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      In food waste
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ↓ 250 lbs CO₂
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Annually
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mt-20 w-full max-w-5xl rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white sm:p-12">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <p className="text-4xl font-bold">50K+</p>
              <p className="mt-2 text-orange-100">Meals Created</p>
            </div>
            <div>
              <p className="text-4xl font-bold">10K+</p>
              <p className="mt-2 text-orange-100">Happy Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold">5 Tons</p>
              <p className="mt-2 text-orange-100">Food Waste Prevented</p>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="mt-20 w-full">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Trusted by Partners
            </h2>
            <p className="mb-12 text-gray-600 dark:text-gray-400">
              MunchAI partners with leading brands and organizations
            </p>
          </div>

          <div className="overflow-hidden">
            <div className="carousel-container flex gap-6 w-max">
              {[...partners, ...partners].map((partner, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-40 flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="text-center">
                    <div className={`mb-2 text-4xl ${partner.color}`}>
                      {partner.emoji}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {partner.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 w-full max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Ready to transform your kitchen?
          </h2>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            Join thousands of users who are saving money, reducing waste, and
            eating better with MunchAI.
          </p>
          <button
            onClick={() => router.push("/register")}
            className="rounded-lg bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:bg-orange-600 dark:hover:bg-orange-700"
          >
            Get Started Free
          </button>
        </section>

        {/* Footer CTA */}
        <section className="mt-20 w-full border-t border-gray-200 pt-12 text-center dark:border-gray-800">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Have questions?{" "}
            <a
              href="mailto:luciano.suen@gmail.com"
              className="font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
            >
              Contact our support team
            </a>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © 2025 MunchAI. All rights reserved.
          </p>
        </section>
      </div>
    </main>
  );
}
