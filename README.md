<div align="center">
  <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200&h=400" alt="Aura Fitness Banner" />

  <br />
  <br />

  <h1>⚡ AuraFit: AI-Powered Fitness Ecosystem</h1>
  
  <p>
    <strong>Engineered by <a href="https://www.linkedin.com/in/balajidasika/">Balaji Dasika</a></strong>
  </p>

  <p>
    A next-generation, Edge AI-powered Progressive Web App (PWA) bridging the gap between professional coaching and intelligent home workouts.
  </p>

  <p>
    <a href="#features"><strong>Explore the Features</strong></a> ·
    <a href="#tech-stack"><strong>View Tech Stack</strong></a> ·
    <a href="#installation"><strong>Installation</strong></a>
  </p>
</div>

<hr />

## 🌟 Vision & Architecture

AuraFit was engineered to push the boundaries of what is possible in the browser. It features a complete **Coach-Client Architecture** allowing trainers to manage athletes remotely, while offering users an entirely on-device **AI Pose Coach** that runs without any server latency. 

The application is built completely mobile-first, installable directly to your home screen as a standalone Progressive Web App (PWA) with offline resilience.

## ✨ Highlight Features

### 🤖 Edge AI Pose Coach (MoveNet Thunder)
- **Zero-Latency Tracking:** Uses TensorFlow.js and MoveNet Thunder to run full-body pose estimation directly on the client's device GPU via WebGL.
- **Split-Screen UX:** A beautiful, responsive split-screen UI displaying high-res reference poses next to the live camera feed.
- **Buttery Smooth Sensor:** Implements a custom **Exponential Moving Average (EMA)** mathematical filter to act as a "shock absorber" for the AI data, completely eliminating skeleton jitter and providing a premium feel.
- **Live Alignment Feedback:** Analyzes joint angles mathematically (e.g., elbow, shoulder, hip relationships) to guide users into perfect form.

### 🏃‍♂️ Comprehensive Fitness Suite
- **Premium Zumba Player:** Embedded, high-energy YouTube Dance and Zumba workouts inside a custom, glassmorphism modal player.
- **Guided Meditation:** A visual and auditory silent meditation timer.
- **Interactive Workout Logger:** Set-by-set weight and rep recording with live volume calculations and multi-muscle group tracking.
- **Voice-Transcribed Notes:** Web Speech API integration allows athletes to dictate training notes dynamically.

### 👥 Coach & Client Dashboards
- **Cryptographic Auth:** Secure PBKDF2 SHA-512 authentication.
- **Live Roster Management:** Coaches generate unique "Invite Codes" that instantly link new clients to their dashboard.
- **Haptic Cheer System:** Coaches can send instant cheers and feedback directly to athlete logs.

## 🛠️ Technology Stack

Designed for high performance, rapid iteration, and strict type safety:

- **Frontend Core:** React 18, TypeScript, Vite
- **Styling:** TailwindCSS, Lucide Icons, Glassmorphism UI patterns
- **AI & ML:** TensorFlow.js, `@tensorflow-models/pose-detection`
- **Backend & API:** Node.js, Express, TypeScript, custom NoSQL Durable JSON Store
- **Web APIs:** Service Workers (PWA), Web Speech API, MediaDevices API
- **Security:** Helmet HTTP Headers, Express Rate Limiter, strict CORS

---

## 🚀 Installation & Local Development

### 1. Clone & Install
```bash
git clone https://github.com/balajidasika-oss/aura-fitness-app.git
cd aura-fitness-app
npm run install:all
```

### 2. Build for Production
This compiles the Vite PWA frontend and the TypeScript backend server:
```bash
npm run build
```

### 3. Run Locally
```bash
npm start
```
The app will serve on `http://localhost:5000`.

---

## ☁️ Deployment

AuraFit is containerized and heavily optimized for modern PaaS providers. It includes configurations for instantaneous deployment:
- **Render.com:** A `render.yaml` Blueprint is included for infrastructure-as-code deployment.
- **Docker:** A multi-stage `Dockerfile` is provided for highly optimized VPS or self-hosted deployment.

## 🤝 Connect with the Developer

I am incredibly passionate about building beautiful, high-performance web applications that merge machine learning with top-tier user experiences.

**Let's connect!**
- **LinkedIn:** [Balaji Dasika](https://www.linkedin.com/in/balajidasika/)
- **Open to Work:** Actively seeking Software Engineering opportunities!
