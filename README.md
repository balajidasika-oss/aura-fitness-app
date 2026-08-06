# ⚡ AURA Fitness - Phone-Native Fitness Coaching Platform

A high-performance, mobile-first full-stack fitness coaching web application engineered with **React, TypeScript, Tailwind CSS, Node.js, Express, and MongoDB** (with zero-config in-memory fallback).

Designed with a sleek, dark-mode glassmorphic interface inspired by elite athletic performance apps, eliminating all clutter and focusing purely on frictionless habit logging and coach visibility.

---

## 📱 Core Features & User Experience

### 1. Client Daily Habit Logger (Mobile-First)
- **3-Habit Daily Routine**:
  1. **🥗 Meal Photos**: Quick photo upload or live camera snap with instant tagging (`Breakfast`, `Lunch`, `Dinner`, `Snack`, `Post-Workout`).
  2. **🏃 Cardio & Distance Tracker**: Slider & stepper distance tracker (km) + duration (mins) with real-time **Pace (min/km)** calculation.
  3. **📸 End-of-Session Selfie**: Live camera or upload of athlete post-workout form & pump.
- **📷 Live Camera Modal**: In-app camera stream utilizing `navigator.mediaDevices.getUserMedia` with alignment grid, flash animation, and canvas extraction.
- **🎙️ Daily Voice Feedback Player**: Dynamic AI-coach voice debrief using the **Web Speech API** with audio equalizer visualizer and motivational briefing.
- **🔊 Web Audio Sound FX**: Native synthetic chimes, camera shutter sound, and coach cheer notifications without external audio file dependencies.
- **✨ Animated Progress Ring**: Real-time habit adherence scoring (0% → 100%) with completion glow and streak fire counter.

### 2. Coach Feed & Daily Check-Ins (Phone-Optimized)
- **⚡ Daily Story Highlights**: Instagram-style tap-to-view fullscreen story bar cycling through athlete workout selfies, meals, and cardio milestones.
- **🔥 1-Tap Quick Cheers**: Instant reaction buttons (`🔥 Crushed It`, `💪 Great Run`, `🥗 Clean Diet`) delivering feedback straight to the athlete.
- **🎙️ Coach Voice Review Generator**: 1-tap synthesized coach audio debriefing athlete metrics.
- **📊 Roster Compliance Tiering**: Automatic categorization into **High Adherence (Green 80-100%)**, **Attention Needed (Yellow 50-79%)**, and **At-Risk (Red <50%)**.

### 3. Complete Client & Coach Authentication
- **1-Tap Persona Switcher**: Instant switching between demo personas (Alex Rivera, Sarah Chen, Coach Kai Brooks).
- **Custom Account Register & Login**: Full auth flow with role selection (Athlete / Head Coach), email authentication, and secure state persistence.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite |
| **Audio & Media** | Web Speech API (`SpeechSynthesis`), Web Audio API (`AudioContext`), `MediaDevices.getUserMedia` |
| **Backend API** | Node.js, Express.js, TypeScript, Multer (multipart photo uploads) |
| **Database** | MongoDB (Mongoose) with automatic high-speed **In-Memory Fallback Engine** |
| **Deployment** | Docker, Vercel, Render.yaml Blueprint, Static Full-Stack Bundle |

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Quick Start (Run Both Services)
```bash
# Clone the repository
git clone https://github.com/your-username/aura-fitness.git
cd aura-fitness

# Install all dependencies (root, server, client)
npm run install:all

# Start backend server in one terminal
npm run dev:server

# Start client in a second terminal
npm run dev:client
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 🌐 Deploying Online

### Option A: 1-Click Deployment to Render (Recommended for Fullstack)
1. Push this repository to GitHub.
2. Go to [Render.com](https://render.com) and select **New > Blueprint**.
3. Connect your repository. Render will automatically detect `render.yaml` and deploy both the Node.js backend and client bundle as a unified service.

### Option B: Deploy Frontend to Vercel
1. Connect this repo to [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Vercel will automatically read `client/vercel.json` and build the production bundle.

### Option C: Docker Container Deployment
```bash
# Build the Docker container
docker build -t aura-fitness-app .

# Run container on port 5000
docker run -p 5000:5000 -e NODE_ENV=production aura-fitness-app
```

---

## 📁 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate client or coach |
| `POST` | `/api/auth/register` | Register new athlete or coach with custom avatar photo |
| `GET` | `/api/auth/demo-users` | Fetch pre-seeded demo roster (athletes & coaches) |
| `GET` | `/api/auth/export-data/:userId` | **GDPR Article 20**: Export full user profile & logs in JSON |
| `DELETE` | `/api/auth/account/:userId` | **GDPR Article 17**: Right to be Forgotten (Account & Logs Erasure) |
| `GET` | `/api/logs/client/:userId/today`| Retrieve today's daily log for a client |
| `POST` | `/api/logs/client/:userId/today`| Submit workout, muscle reps, cardio, and voice memo |
| `POST` | `/api/logs/upload` | Upload photos and audio blobs via Multer |
| `POST` | `/api/logs/:logId/feedback` | Coach submits voice/text feedback or reaction chimes |
| `GET` | `/api/clients/roster` | Coach roster view with adherence tiering |
| `POST` | `/api/seed/reset` | Re-seed sample clients and historical check-in logs |
| `GET` | `/api/health` | Health status and database engine mode |

---

## 📱 Mobile App (PWA) & Phone Usage Guide

Aura is engineered as a **Progressive Web App (PWA)**, allowing it to run fullscreen on smartphones without app store friction.

### 🍏 iOS (iPhone & iPad Safari)
1. Open Aura in **Safari**.
2. Tap the **Share** button (box with an upward arrow) at the bottom toolbar.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add** in the top right. Launch Aura from your home screen for full OLED dark-mode fullscreen experience.

### 🤖 Android (Chrome)
1. Open Aura in **Chrome**.
2. Tap the **three dots (⋮)** menu or click the **"Install on Phone"** button in the app header.
3. Tap **"Install App"** / **"Add to Home screen"**.

---

## ⚖️ Legal Compliance, Health Disclaimers & Security

- **PAR-Q Health Waiver**: Integrated Physical Activity Readiness Questionnaire waiver ensures athletes review cardiovascular readiness before training.
- **HIPAA-Aligned Fitness Guidance**: Clear disclosures that the platform provides physical conditioning accountability, not medical diagnosis or treatment.
- **GDPR (EU 2016/679) & CCPA Privacy**:
  - **Article 20 Data Portability**: 1-click machine-readable JSON export of all personal metrics, logs, and account data.
  - **Article 17 Right to Erasure**: Irreversible account & data deletion.
- **Hardened Backend Security**:
  - **Helmet HTTP Security Headers**: HSTS, X-Content-Type-Options, X-Frame-Options, Cross-Origin-Resource-Policy.
  - **Rate Limiting**: Multi-tiered rate limiters protecting authentication routes from brute force and API endpoints from DDoS attacks.
  - **Encrypted Local Persistence**: Secure credentials and tokens isolation.

---

## 🎨 Design System & Aesthetics
- **Dark Mode Luxury Palette**: Deep Obsidian `#07090e`, Slate `#0f172a`, Emerald `#10b981`, Amber `#f59e0b`, Indigo `#6366f1`.
- **Micro-Interactions**: Haptic synthetic audio feedback, smooth progress animations, pulsing live indicators, and dynamic iPhone shell frame.
