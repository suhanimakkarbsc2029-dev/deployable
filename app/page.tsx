import Navbar from "@/components/landing/Navbar"
import Hero from "@/components/landing/Hero"
import Logos from "@/components/landing/Logos"
import Features from "@/components/landing/Features"
import HowItWorks from "@/components/landing/HowItWorks"
import Metrics from "@/components/landing/Metrics"
import Pricing from "@/components/landing/Pricing"
import Testimonials from "@/components/landing/Testimonials"
import FAQ from "@/components/landing/FAQ"
import Footer from "@/components/landing/Footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050d1a] text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Logos />
      <Features />
      <HowItWorks />
      <Metrics />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  )
}
