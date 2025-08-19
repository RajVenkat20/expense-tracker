"use client";

import { SignUp } from "@clerk/nextjs";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Page() {
  const slides = [
    {
      src: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1600",
      title: "Welcome to PennyPilot",
      desc: "Track every penny in one simple, intuitive app.",
    },
    {
      src: "https://images.unsplash.com/photo-1551281044-8d8eef54d89b?q=80&w=1600",
      title: "Smarter budgets",
      desc: "Plan ahead with flexible categories and limits.",
    },
    {
      src: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600",
      title: "Clear insights",
      desc: "Real-time charts to help you save more.",
    },
  ];

  return (
    <section className="relative min-h-screen">
      {/* Match landing gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/60 via-white to-white" />

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-12">
        {/* LEFT: HERO CAROUSEL */}
        <aside className="relative order-last hidden lg:order-first lg:col-span-6 lg:block">
          <div className="relative h-screen overflow-hidden bg-gray-900">
            <Carousel
              className="h-full [&_.overflow-hidden]:h-full"
              opts={{ loop: true, align: "start" }}
              plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
            >
              <CarouselContent className="h-full">
                {slides.map((s, i) => (
                  <CarouselItem key={i} className="h-full">
                    <div className="relative h-full">
                      {/* Image fills the slide; establishes height */}
                      <img
                        src={s.src}
                        alt={s.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />

                      {/* Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-indigo-300/30 blur-3xl"
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-violet-300/30 blur-3xl"
                      />

                      {/* Caption */}
                      <div className="absolute inset-x-0 bottom-0 z-10 p-12">
                        <div className="mb-2 flex items-center gap-2 text-white/90">
                          <span className="text-2xl">🦑</span>
                          <span className="text-xl font-semibold">PennyPilot</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white sm:text-4xl">
                          {s.title}
                        </h2>
                        <p className="mt-2 max-w-md text-white/85">{s.desc}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow" />
              <CarouselNext className="right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 hover:bg-white shadow" />
            </Carousel>
          </div>
        </aside>

        {/* RIGHT: SIGN-UP CARD */}
        <main className="order-first flex items-center justify-center px-6 py-10 lg:order-last lg:col-span-6 lg:px-16">
          <div className="w-full max-w-md">
            {/* Mobile brand chip */}
            <div className="mb-6 flex items-center justify-center lg:hidden">
              <span className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow ring-1 ring-indigo-100">
                PennyPilot
              </span>
            </div>

            <SignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              appearance={{
                variables: {
                  colorPrimary: "#4f46e5", // indigo-600
                  colorText: "#111827",    // gray-900
                  colorBackground: "#ffffff",
                  borderRadius: "0.75rem",
                },
                elements: {
                  rootBox: "mx-auto w-full",
                  card: "shadow-xl rounded-2xl border border-gray-100",
                  headerTitle: "text-gray-900",
                  headerSubtitle: "text-gray-500",
                  socialButtons: "grid grid-cols-1 gap-2",
                  socialButtonsBlockButton:
                    "rounded-xl ring-1 ring-gray-200 shadow-none hover:ring-indigo-200",
                  dividerRow: "text-gray-400",
                  formFieldLabel: "text-gray-700",
                  formFieldInput:
                    "rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-200/80 focus:border-indigo-300",
                  formButtonPrimary:
                    "rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-transform ease-out duration-200 hover:scale-[1.02]",
                  footer: "hidden",
                },
              }}
            />

            <p className="mt-4 text-center text-xs text-gray-400">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </main>
      </div>
    </section>
  );
}
