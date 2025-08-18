"use client";

import Image from "next/image";
import React from "react";
import { useUser } from "@clerk/nextjs";

function Banner() {
  const { isLoaded, isSignedIn } = useUser();
  const href = isLoaded && isSignedIn ? "/dashboard" : "/sign-in";

  return (
    <section className="relative overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/60 via-white to-white" />

      {/* HERO */}
      <div className="relative mx-auto w-screen max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Take control of your spending and watch your savings soar with{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
                PennyPilot
              </span>
            </h1>

            <p className="mt-4 text-base text-gray-700 sm:text-lg">
              Track every penny, set smarter budgets, and make confident money
              decisions — all in one simple, intuitive app.
            </p>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href={href}
                className="inline-block rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition-transform duration-200 hover:scale-[1.03] hover:bg-indigo-700"
              >
                Get Started
              </a>

              <a
                href="#features"
                className="inline-block rounded-xl border border-indigo-200 bg-white px-6 py-3 font-medium text-indigo-700 transition-colors duration-200 hover:border-indigo-300 hover:bg-indigo-50"
              >
                See Demo
              </a>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              No credit card needed • Free to try • Cancel anytime
            </p>

            {/* Quick stats (optional; tweak numbers or remove) */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
              <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-gray-100">
                <p className="text-2xl font-semibold text-gray-900">+$1,200</p>
                <p className="text-xs text-gray-500">Avg. yearly savings*</p>
              </div>
              <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-gray-100">
                <p className="text-2xl font-semibold text-gray-900">3 mins</p>
                <p className="text-xs text-gray-500">to create first budget</p>
              </div>
              <div className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-gray-100">
                <p className="text-2xl font-semibold text-gray-900">AES-256</p>
                <p className="text-xs text-gray-500">bank-level security</p>
              </div>
            </div>
          </div>

          {/* Hero image / mockup */}
          <div className="relative order-first -mx-4 sm:mx-0 lg:order-last">
            {/* Replace /hero-mock.png with your actual screenshot */}
            <div className="mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
              <Image
                src="/hero-mock.png"
                alt="PennyPilot dashboard preview"
                width={1200}
                height={900}
                priority
                className="h-auto w-full"
              />
            </div>

            {/* Decorative blur */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-indigo-300/40 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -right-6 h-40 w-40 rounded-full bg-violet-300/40 blur-3xl"
            />
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" className="relative mx-auto max-w-screen-xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3 text-center">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-transform duration-200 hover:scale-[1.01]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl">
              💰
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Smarter Budgets</h3>
            <p className="mt-2 text-sm text-gray-600">
              Plan ahead with flexible categories, limits, and rollover rules.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-transform duration-200 hover:scale-[1.01]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl">
              📊
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Clear Insights</h3>
            <p className="mt-2 text-sm text-gray-600">
              Real-time charts show where money goes and how to save more.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-transform duration-200 hover:scale-[1.01]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl">
              🔒
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Secure & Private</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your data stays encrypted at rest and in transit, always.
            </p>
          </div>
        </div>

        {/* footnote */}
        <p className="mt-6 text-center text-xs text-gray-400">
          *Sample figure based on typical budgeting improvements; results vary.
        </p>
      </div>
    </section>
  );
}

export default Banner;
