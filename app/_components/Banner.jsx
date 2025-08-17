"use client"

import Image from "next/image";
import React from "react";
import { useUser } from "@clerk/nextjs";

function Banner() {
  const { isLoaded, isSignedIn } = useUser();
  const href = isLoaded && isSignedIn ? "/dashboard" : "/sign-in";

  return (
    <section className="bg-white lg:grid flex items-center flex-col">
      <div className="mx-auto w-screen max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-prose text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Take control of your spending and watch your savings soar using<strong className="text-indigo-600"> PennyPilot</strong>
          </h1>

          <p className="mt-4 text-base text-pretty text-gray-700 sm:text-lg/relaxed">
            Track every penny, set smarter budgets, and make confident money decisions — all in one simple, intuitive app.
          </p>

          <div className="mt-4 flex justify-center gap-4 sm:mt-6">
            <a
              className="inline-block rounded-lg border bg-indigo-600 px-5 py-3 font-medium text-white shadow-lg transition-all transform ease-out duration-400 hover:scale-110 hover:bg-indigo-700"
              href={href}
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
      <Image src={'/logo.svg'} alt='placeholder'
             width={1000} height={700}
             className="mt-5 rounded-xl border-2"/>
    </section>
  );
}

export default Banner;
