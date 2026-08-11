# ⚡ AURA Fitness Coaching Platform

Aura Fitness is a full-stack, phone-native fitness coaching web application (Progressive Web App). It provides personal trainers and fitness coaches with a centralized dashboard to manage athletes, while giving clients an intuitive, mobile-optimized experience to track their daily workouts, nutrition, cardio, and voice notes.

![Aura Fitness Showcase](https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200&h=400)

## ✨ Key Features

- **Coach-Client Architecture**: Cryptographic user authentication (PBKDF2 SHA-512). Coaches generate unique "Invite Codes" that clients use during registration to link directly to the coach's roster.
- **Progressive Web App (PWA)**: Full-bleed mobile UI with iOS/Android safe-area insets. Installable directly to the home screen as a standalone app.
- **Interactive Workout Logger**: Set-by-set weight and rep recording with live volume calculations and multi-muscle group tracking.
- **Comprehensive Tracking**: Complete suite for cardio tracking (distance, pace, stairmaster), nutrition (macros, calories, photos), and Web Speech API integration for voice-transcribed training notes.
- **Live Coach Feedback**: Coaches can send instant haptic cheers and feedback directly to athlete logs.
- **Persistent Data Storage**: File-backed NoSQL JSON durable store handling schemas, relations, and continuous persistence.
- **Legal & Compliance**: Built-in GDPR data exports, account deletion, and integrated Liability Waivers / Terms of Service.

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, TypeScript, custom `DurableStore` JSON persistence.
- **Security**: Helmet HTTP Headers, Express Rate Limiter, strict CORS, and secure HTTP-only configurations.
- **Deployment**: Docker multi-stage builds, Render/Railway ready.

---

## 🚀 Permanent 24/7 Cloud Deployment Guide

To have this app running **permanently online 24/7** with its own permanent URL (e.g., `https://my-fitness-app.onrender.com` or `https://my-fitness-app.up.railway.app`) without needing your personal computer to stay on:

### Option 1: Render.com (Recommended — 100% Free & Automatic)

1. Create a free account at [https://render.com](https://render.com).
2. Create a new GitHub repository (e.g. `fitness-coach-app`) at [https://github.com/new](https://github.com/new).
3. In your local project terminal, link and push your code to your GitHub repo:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/fitness-coach-app.git
   git branch -M main
   git push -u origin main
   ```
4. On Render Dashboard:
   - Click **New +** -> **Web Service**.
   - Connect your `fitness-coach-app` GitHub repository.
   - Render will auto-detect the configuration (`render.yaml` is included), or enter:
     - **Build Command**: `npm run build`
     - **Start Command**: `npm start`
     - **Environment**: `Node`
   - Click **Deploy Web Service**.
5. Your permanent live URL will be active within 2 minutes with free SSL HTTPS enabled!

### Option 2: Railway.app (1-Click Instant Deploy)

1. Go to [https://railway.app](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. Railway will automatically build and start the app using `npm run build` and `npm start`.
5. Under service settings, click **Generate Domain** to get your permanent `.up.railway.app` URL.

### Option 3: Docker Container Deployment

You can run or deploy the multi-stage Docker container on any server, VPS, or cloud host:

```bash
# Build the Docker image
docker build -t aura-fitness-app .

# Run the container locally or on your VPS
docker run -p 5000:5000 -v $(pwd)/data:/app/data aura-fitness-app
```

---

## 🛠 Local Development & Verification

```bash
# 1. Install dependencies
npm run install:all

# 2. Build for production (compiles Vite PWA & TypeScript server)
npm run build

# 3. Run production server locally
npm start
```

Server runs on `http://localhost:5000`.

---

## 🔑 Pre-Configured Test Accounts

| Role | Email | Password | Invite Code |
| :--- | :--- | :--- | :--- |
| **Head Coach** | `coach.marcus@aurafit.com` | `secretpassword123` | `COACH-COAC-2312` |
| **Athlete (Client)** | `alex.rivera@gmail.com` | `clientsecret123` | Linked to Coach Marcus |

---

*This project was designed and built to demonstrate advanced full-stack capabilities, responsive mobile UI/UX, and robust API design.*
