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

## 🚀 Infrastructure & Deployment

The application is containerized and configured for modern PaaS (Platform as a Service) and IaaS environments. Multi-stage Docker builds ensure a minimal production footprint.

### Cloud Native (PaaS)

Deployment configurations for managed platforms are included in the repository.

#### Render
The repository includes a `render.yaml` for infrastructure-as-code deployment on Render.
1. Connect this repository to your Render account.
2. The Blueprint will automatically provision the Node web service using `npm run build` and `npm start`.

#### Railway / Heroku
A standard `Procfile` is included for seamless integration with Heroku or Railway. Simply connect the repository to your dashboard and deploy.

### Containerization (Docker)

For custom VPS or self-hosted environments, utilize the provided multi-stage `Dockerfile`:

```bash
# Build the production image
docker build -t aura-fitness-app .

# Run the container (maps the persistent data volume)
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
