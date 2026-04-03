import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Deployable — Ship ads that actually convert",
  description:
    "Deployable connects your Meta Ads and website into one intelligent dashboard. See your true ROAS, fix leaking funnels, and know exactly what's making you money.",
  keywords: ["ecommerce analytics", "Meta Ads", "ROAS tracking", "D2C analytics", "ad performance"],
  openGraph: {
    title: "Deployable — Ship ads that actually convert",
    description: "The intelligent analytics platform for D2C brands.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#050d1a] text-white`}>
        {children}
      </body>
    </html>
  )
}
