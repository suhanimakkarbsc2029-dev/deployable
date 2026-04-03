"use client"

import { motion } from "framer-motion"

const brands = [
  { name: "Bewakoof", color: "text-purple-400" },
  { name: "Mamaearth", color: "text-green-400" },
  { name: "Snitch", color: "text-orange-400" },
  { name: "Wow Skin", color: "text-cyan-400" },
  { name: "boAt", color: "text-blue-400" },
  { name: "mCaffeine", color: "text-amber-400" },
]

export default function Logos() {
  return (
    <section className="py-16 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-medium text-slate-500 uppercase tracking-widest mb-10"
        >
          Trusted by fast-growing D2C brands
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group"
            >
              <span
                className={`text-xl sm:text-2xl font-black tracking-tight opacity-40 group-hover:opacity-80 transition-opacity ${brand.color} filter grayscale group-hover:grayscale-0 transition-all duration-300`}
              >
                {brand.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
