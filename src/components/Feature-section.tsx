"use client";

import { motion } from "framer-motion";
import { Brain, MapPin, Cloud, Download } from "lucide-react";
import FeatureCard from "./Feature-card";

const features = [
  {
    title: "AI-Powered Itineraries",
    description:
      "Smart day-by-day plans tailored to your style, budget, and must-sees.",
    icon: Brain,
  },
  {
    title: "Interactive Map",
    description:
      "See all your activities on a beautiful map with pins and routes.",
    icon: MapPin,
  },
  {
    title: "Weather Forecast",
    description:
      "Up-to-date weather for every day of your trip.",
    icon: Cloud,
  },
  {
    title: "Export & Sharey",
    description:
      "Download PDF or share via link — no signup needed.",
    icon: Download,
  },
];

export default function FeatureSection() {
  return (
    <section className="py-24 bg-background lg:max-w-[1200px] lg:mx-auto">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Powerful Features
          </h2>
          {/* <p className="text-muted-foreground text-lg">
            Everything you need to build fast, modern, and scalable applications.
          </p> */}
        </motion.div>

        {/* Feature Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.7 }}
                viewport={{ once: true }}
              >
                <FeatureCard title={feature.title} description={feature.description} icon={Icon} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
