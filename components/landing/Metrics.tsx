"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"

const metrics = [
  { value: 2.4, suffix: "x", label: "Average ROAS improvement", description: "Across all active brands using Deployable for 90+ days" },
  { value: 43, suffix: "%", label: "Reduction in wasted ad spend", description: "By identifying underperforming creatives and audiences faster" },
  { value: 5, suffix: " min", label: "Average setup time", description: "From signup to your first live dashboard" },
]

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1500
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(parseFloat(current.toFixed(1)))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  )
}

export default function Metrics() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">By the numbers</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Results that speak for themselves
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-white/10 bg-white/3 p-8 text-center overflow-hidden group hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="text-6xl sm:text-7xl font-black gradient-text mb-3">
                  <Counter value={metric.value} suffix={metric.suffix} />
                </div>
                <p className="text-lg font-bold text-white mb-2">{metric.label}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{metric.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
