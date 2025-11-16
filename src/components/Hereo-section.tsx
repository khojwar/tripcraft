"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative w-full py-24 md:py-40 bg-background">
      <div className="container mx-auto px-4 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center rounded-full border px-3 py-1 text-sm mb-6"
        >
          <span className="mr-2 h-2 w-2 rounded-full bg-primary" />
          <span className="font-medium">New • AI Powered</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-4xl md:text-6xl font-bold tracking-tight leading-tight"
        >
          Plan Your Perfect Trip 
          <span className="text-blue-700"> in Seconds</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Enter your details and let AI create a personalized day-by-day itinerary, budget, map & weather — all in your browser.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="mt-10 flex justify-center gap-4"
        >
          <Button size="lg" className="rounded-2xl px-8">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button size="lg" variant="outline" className="rounded-2xl px-8">
            How it works
          </Button>
        </motion.div>
      </div>

      {/* Decorative Background Blur */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-1/3 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-10 right-1/3 h-72 w-72 rounded-full bg-purple-400/20 dark:bg-purple-500/10 blur-3xl" />
      </div>
    </section>
  );
}
