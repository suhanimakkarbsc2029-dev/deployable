"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Arjun Mehta",
    role: "Founder & CEO",
    company: "NudgeFit",
    companyDesc: "D2C Fitness & Supplements Brand, Bangalore",
    avatar: "AM",
    avatarColor: "from-cyan-500 to-blue-600",
    rating: 5,
    quote:
      "Before Deployable, I was flying blind with Meta's attribution. We thought a retargeting campaign was our top performer at 4.2x ROAS — Deployable showed the real number was 1.8x. We reallocated that ₹2L/month budget and our overall ROAS jumped from 2.1x to 3.4x in 6 weeks. This is the tool I wish I had at Series A.",
  },
  {
    name: "Priya Sharma",
    role: "Growth Lead",
    company: "Veda Naturals",
    companyDesc: "Organic Skincare Brand, Mumbai",
    avatar: "PS",
    avatarColor: "from-violet-500 to-pink-600",
    rating: 5,
    quote:
      "The funnel analysis literally saved our Diwali sale. We noticed a 60% drop-off at checkout 2 days before the sale went live — turned out our COD option wasn't showing on mobile. Fixed it in an hour. That single bug fix recovered ₹14L in orders over the sale weekend. Deployable paid for itself 50x over.",
  },
  {
    name: "Karan Bhatia",
    role: "Co-founder",
    company: "The Bold Tribe",
    companyDesc: "Men's Streetwear Brand, Delhi",
    avatar: "KB",
    avatarColor: "from-emerald-500 to-teal-600",
    rating: 5,
    quote:
      "We scaled from ₹15L to ₹80L monthly revenue in 4 months using Deployable's AI insights. The creative fatigue alerts are insane — it catches declining CTR before our CPA spikes. The setup was so fast, our team thought something was wrong. Highly recommend for any D2C brand spending ₹3L+ per month on Meta.",
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/3 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Loved by D2C founders
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="rounded-2xl border border-white/10 bg-white/3 p-7 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-slate-300 leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}, {t.company}</p>
                  <p className="text-xs text-slate-500">{t.companyDesc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
