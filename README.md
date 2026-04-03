# Deployable — Ship ads that actually convert

A full-stack ecommerce analytics SaaS for D2C brands running Meta Ads. Built with Next.js 14, Tailwind CSS, Recharts, and Framer Motion.

## Overview

Deployable connects your Meta Ads account and website into one intelligent dashboard. It provides true ROAS tracking, funnel analysis, AI-powered insights, and profit reporting — all in a beautiful dark-theme UI.

### Pages
- `/` — YC-quality marketing landing page
- `/login` — Auth login page
- `/signup` — Signup with 14-day free trial
- `/dashboard` — Main KPI overview + charts + top ads table
- `/dashboard/campaigns` — Meta campaign cards with metrics
- `/dashboard/website` — Funnel analysis + traffic sources
- `/dashboard/insights` — AI Insights with severity tags

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Language | TypeScript |
| Deployment | Vercel |

## Local Setup

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Clone or navigate to the project directory
cd deployable

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

## Vercel Deployment (One Command)

### Option 1: Via Vercel CLI

```bash
# Install Vercel CLI globally (if not already installed)
npm i -g vercel

# Deploy from project root
vercel --prod
```

### Option 2: Via GitHub

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repository
4. Click **Deploy** — zero configuration required

Vercel auto-detects Next.js and sets optimal build settings.

## Project Structure

```
deployable/
├── app/
│   ├── layout.tsx              # Root layout with fonts + metadata
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles + CSS variables
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   └── dashboard/
│       ├── layout.tsx          # Dashboard layout with sidebar
│       ├── page.tsx            # Overview dashboard
│       ├── campaigns/page.tsx  # Meta campaigns
│       ├── website/page.tsx    # Website analytics
│       └── insights/page.tsx   # AI Insights
├── components/
│   ├── landing/                # Landing page sections
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx            # Hero with live Recharts mockup
│   │   ├── Logos.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Metrics.tsx         # Animated number counters
│   │   ├── Pricing.tsx         # Annual/monthly toggle
│   │   ├── Testimonials.tsx
│   │   ├── FAQ.tsx             # Accordion FAQ
│   │   └── Footer.tsx
│   └── dashboard/
│       ├── Sidebar.tsx         # Collapsible sidebar + mobile drawer
│       └── KPICard.tsx         # Reusable KPI card with skeleton
├── lib/
│   ├── mock-data.ts            # All mock data (Indian D2C context)
│   └── utils.ts                # cn(), formatINR(), formatNumber()
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

## Design System

- **Background**: `#050d1a` (deep navy)
- **Cards**: `rgba(255,255,255,0.03)` with `rgba(255,255,255,0.08)` borders
- **Primary accent**: Cyan `#00c4f0` → Blue `#3b82f6` gradient
- **Success**: Emerald `#34d399`
- **Warning**: Amber `#f59e0b`
- **Critical**: Red `#f87171`
- **Font**: Inter (Google Fonts)

---

Made with ❤️ in India 🇮🇳
