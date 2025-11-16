"use client";

import { motion } from "framer-motion";

export default function FeatureCard({ title, description, icon: Icon }: {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="p-6 rounded-2xl border bg-card hover:shadow-xl transition-all flex flex-col justify-center items-center text-center"
    >
      {/* Icon Box */}
      <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
        <Icon className="h-6 w-6" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
