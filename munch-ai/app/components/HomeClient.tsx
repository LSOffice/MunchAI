"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChefHat,
  Leaf,
  Refrigerator,
  Scan,
  Star,
} from "lucide-react";
import Link from "next/link";

const partners = [
  { name: "Whole Foods", emoji: "🛒" },
  { name: "Instacart", emoji: "🥬" },
  { name: "Earth911", emoji: "🌱" },
  { name: "Too Good To Go", emoji: "♻️" },
  { name: "Freshly", emoji: "🍎" },
  { name: "Local Harvest", emoji: "🌾" },
];

const features = [
  {
    title: "Smart Receipt Scanning",
    description:
      "Instantly turn paper receipts into a digital pantry inventory with our advanced OCR technology.",
    icon: Scan,
  },
  {
    title: "Pantry Tracking",
    description:
      "Keep tabs on what you have. Get notified before food expires so you never waste a bite.",
    icon: Refrigerator,
  },
  {
    title: "AI Recipe Generation",
    description:
      "Don't know what to cook? Our AI suggests recipes based on ingredients you already have.",
    icon: ChefHat,
  },
  {
    title: "Waste Reduction",
    description:
      "Track your waste reduction impact and see how much money you're saving every month.",
    icon: Leaf,
  },
];

const testimonials = [
  {
    quote:
      "MunchAI has completely changed how I meal plan. No more wasted food, and I'm discovering recipes I'd never have thought of!",
    author: "Sarah M.",
    role: "Busy Parent",
    rating: 5,
  },
  {
    quote:
      "Finally, a smart way to reduce food waste. The AI recommendations are surprisingly accurate and delicious.",
    author: "James T.",
    role: "Sustainability Advocate",
    rating: 5,
  },
  {
    quote:
      "The receipt scanner is a game-changer. I spend 2 seconds scanning instead of 10 minutes typing out groceries.",
    author: "Emma L.",
    role: "Home Chef",
    rating: 5,
  },
];

const pricing = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "Perfect for individuals wanting to get organized.",
    features: [
      "Scan 5 receipts/month",
      "Basic pantry tracking",
      "10 AI recipe generations",
      "Community support",
    ],
    cta: "Start for Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For serious home cooks who want to save more.",
    features: [
      "Unlimited receipt scanning",
      "Advanced expiration tracking",
      "Unlimited AI recipes",
      "Meal planning calendar",
      "Priority support",
    ],
    cta: "Get Pro",
    popular: true,
  },
  {
    name: "Family",
    price: "$19",
    period: "/month",
    description: "Manage the whole household's nutrition.",
    features: [
      "Everything in Pro",
      "Multiple user accounts",
      "Shared shopping lists",
      "Dietary restriction filters",
      "Nutritional analysis",
    ],
    cta: "Get Family",
    popular: false,
  },
];

export default function HomeClient() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-2"></span>
              v2.0 is now live
            </div>

            <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-7xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Your kitchen, <span className="text-orange-500">organized</span>{" "}
              by AI.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              MunchAI helps you track your pantry, reduce food waste, and
              discover delicious recipes based on what you already have.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
              <button
                onClick={() => router.push("/register")}
                className="group relative inline-flex items-center justify-center rounded-lg bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById("features");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm font-semibold leading-6 text-slate-900 dark:text-white hover:text-orange-500 transition-colors"
              >
                Learn more <span aria-hidden="true">→</span>
              </button>
            </div>

            {/* Hero Image / Dashboard Preview */}
            <div className="mt-16 flow-root sm:mt-24 animate-in fade-in zoom-in duration-1000 delay-500">
              <div className="-m-2 rounded-xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-2xl lg:p-4 dark:bg-white/5 dark:ring-white/10">
                <div className="rounded-lg bg-white shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-white/10 overflow-hidden">
                  {/* Placeholder for dashboard image - using a gradient div for now to simulate a UI */}
                  <div className="aspect-[16/9] w-full bg-gradient-to-br from-orange-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto h-20 w-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                          <ChefHat className="h-10 w-10 text-orange-500" />
                        </div>
                        <p className="text-slate-400 font-medium">
                          Dashboard Preview
                        </p>
                      </div>
                    </div>
                    {/* Mock UI Elements */}
                    <div className="absolute top-4 left-4 right-4 bottom-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg opacity-50"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-lg font-semibold leading-8 text-slate-900 dark:text-white">
            Trusted by forward-thinking home cooks and partners
          </h2>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-6">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 flex items-center justify-center grayscale opacity-70 hover:opacity-100 transition-opacity cursor-default"
              >
                <span className="text-2xl mr-2">{partner.emoji}</span>
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-900/50"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-orange-600">
              Productivity for your pantry
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Everything you need to master your kitchen
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              MunchAI combines powerful AI with intuitive design to help you
              save time, money, and food.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900 dark:text-white">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-orange-500/10">
                      <feature.icon
                        className="h-6 w-6 text-orange-600"
                        aria-hidden="true"
                      />
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-400">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-orange-600">
              Testimonials
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Loved by thousands of home cooks
            </p>
          </div>
          <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-50 p-8 text-sm leading-6 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-x-1 text-orange-500 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-slate-900 dark:text-slate-300">
                    <p>"{testimonial.quote}"</p>
                  </blockquote>
                  <div className="mt-6 flex items-center gap-x-4">
                    <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-500">
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {testimonial.author}
                      </div>
                      <div className="text-slate-600 dark:text-slate-500">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 sm:py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Start for free, upgrade when you need more power.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
            {pricing.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 xl:p-10 ${
                  tier.popular
                    ? "ring-2 ring-orange-500 shadow-xl scale-105 relative"
                    : ""
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    Most Popular
                  </span>
                )}
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h3 className="text-lg font-semibold leading-8 text-slate-900 dark:text-white">
                      {tier.name}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {tier.description}
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {tier.price}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-slate-600 dark:text-slate-400">
                      {tier.period}
                    </span>
                  </p>
                  <ul
                    role="list"
                    className="mt-8 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400"
                  >
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <Check
                          className="h-6 w-5 flex-none text-orange-600"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => router.push("/register")}
                  className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    tier.popular
                      ? "bg-orange-600 text-white shadow-sm hover:bg-orange-500 focus-visible:outline-orange-600"
                      : "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <svg
            className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-slate-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)] dark:stroke-slate-800"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="e813992c-7d03-4cc4-a2bd-151760b470a0"
                width={200}
                height={200}
                x="50%"
                y={-1}
                patternUnits="userSpaceOnUse"
              >
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              strokeWidth={0}
              fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)"
            />
          </svg>
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Ready to stop wasting food?
            <br />
            Start your journey today.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            Join the community of smart home cooks who are saving money and the
            planet, one meal at a time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={() => router.push("/register")}
              className="rounded-md bg-orange-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              Get started
            </button>
            <button
              onClick={() => router.push("/login")}
              className="text-sm font-semibold leading-6 text-slate-900 dark:text-white"
            >
              Log in <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
          <nav
            className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
            aria-label="Footer"
          >
            <div className="pb-6">
              <Link
                href="#"
                className="text-sm leading-6 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                About
              </Link>
            </div>
            <div className="pb-6">
              <Link
                href="#"
                className="text-sm leading-6 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Blog
              </Link>
            </div>
            <div className="pb-6">
              <Link
                href="#"
                className="text-sm leading-6 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Jobs
              </Link>
            </div>
            <div className="pb-6">
              <Link
                href="#"
                className="text-sm leading-6 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Press
              </Link>
            </div>
            <div className="pb-6">
              <Link
                href="#"
                className="text-sm leading-6 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Privacy
              </Link>
            </div>
            <div className="pb-6">
              <Link
                href="#"
                className="text-sm leading-6 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Terms
              </Link>
            </div>
          </nav>
          <p className="mt-10 text-center text-xs leading-5 text-slate-500">
            &copy; 2025 MunchAI, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
