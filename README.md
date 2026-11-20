# 🏋️‍♂️ IronPulse - Mobile-First Gym Lifter PWA

**IronPulse** is a modern, high-performance, mobile-first Progressive Web App (PWA) tailored specifically for gym lifters. It features a sleek "Dark Mode" aesthetic, offline-first reliability with 100% `localStorage` persistence, automatic PR detection, and zero database setup.

---

## ✨ Features

- **⚡ Dark Gym Aesthetic**: Deep charcoal (`#0F1115`) background, dark slate cards (`#181B20`), high-contrast white typography, and electric lime (`#A3E635`) accents.
- **📱 Mobile-First UX**: Thumb-friendly buttons and inputs designed for easy logging in between heavy sets.
- **🏋️ Workout Session Tab**:
  - Quick-start for today's scheduled split or freestyle empty workouts.
  - Exercise cards displaying previous performance references (weight × reps).
  - One-tap set completion with checkmark buttons.
  - **Floating Rest Timer**: Triggered automatically on set completion with default 90s, `+15s`, `-15s`, and `Skip` controls.
  - **Celebration Confetti & PR Badge**: Instant visual rewards whenever a personal record is broken.
- **📅 Routines Tab**:
  - Pre-loaded **6-Day Push-Pull-Legs (PPL)** split (Push A/B, Pull A/B, Legs A/B, and Sunday Rest & Recovery).
  - Full routine editor: create custom programs, adjust target sets/reps, and add custom exercises.
- **📈 Progress Tab**:
  - Interactive **Estimated 1-Rep Max (1RM)** strength curve chart per exercise using the Brzycki formula.
  - **Body Weight Tracker**: Track morning weigh-ins over time.
  - Summary metrics: Total Workouts, Streak, and Total Volume Lifted (Tonnes).
- **🥗 Nutrition & Recovery Tab**:
  - Daily calorie & macronutrient progress bars (Protein, Carbs, Fats).
  - Quick "+ Log Meal" entry and customizable daily macro targets.
- **📶 100% Offline & PWA**:
  - Saves all data automatically to browser `localStorage`.
  - Installable directly to home screens on iOS and Android.

---

## 🚀 Quick Start (Local Development)

To run IronPulse locally on your computer:

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Start the local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Free 2-Minute Deployment Guide (No Command Line Required)

You can host **IronPulse** online completely free in under 2 minutes so you can use it on your phone at the gym:

### Option A: Deploy to Vercel (Recommended)
1. **Push your code to GitHub**:
   - Create a new repository on [GitHub](https://github.com/new) called `ironpulse`.
   - Push this project folder to your new repository.
2. **Go to Vercel**:
   - Open [vercel.com](https://vercel.com) and log in with your GitHub account.
   - Click **"Add New..."** → **"Project"**.
   - Select your `ironpulse` repository from the list and click **"Import"**.
   - Vercel will automatically detect **Vite** as the framework.
   - Click **"Deploy"**!
3. In under 45 seconds, you will receive a live URL (e.g. `https://ironpulse.vercel.app`).

### Option B: Deploy to Netlify
1. Open [netlify.com](https://netlify.com) and log in.
2. Click **"Add new site"** → **"Import an existing project"**.
3. Choose **GitHub** and select your `ironpulse` repository.
4. Set Build command to `npm run build` and Publish directory to `dist`.
5. Click **"Deploy IronPulse"**.

---

## 📲 How to Install as an App on Your Phone

Once your site is live (or opened on mobile via your local network):
- **On iPhone (Safari)**: Tap the **Share** button (box with upward arrow) → tap **"Add to Home Screen"**.
- **On Android (Chrome)**: Tap the **Three Dots (⋮)** in the top right → tap **"Install app"** or **"Add to Home screen"**.

You can now use IronPulse with full-screen native app feel and complete offline capability!
