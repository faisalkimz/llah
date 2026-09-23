# Llah — Full Code-First Agent Starter

Llah is a metered billing and revenue operations platform for SaaS, AI, API, cloud and infrastructure businesses.

This repository is intentionally **code-first**. It gives a coding agent the complete product map from authentication to production hardening while enforcing a strict module-by-module implementation workflow.

## Locked Stack
- Web: React + Vite + JavaScript + Tailwind CSS
- API: Node.js + Express + JavaScript
- Database: Neon Serverless PostgreSQL + Prisma ORM
- Mobile: React Native + Expo + JavaScript + NativeWind
- API style: REST
- Icons: Lucide / lucide-react / lucide-react-native
- Validation: Zod
- Tests: Vitest + Supertest
- Package manager: npm workspaces

## Non-negotiable UI direction
The product must feel restrained, human-designed and professional: Notion/Linear/Stripe/Vercel-like. No AI visual language, no gradients, no glassmorphism, no neon glow, no giant floating cards, no excessive border radii, no decorative 3D, no robot art, no fake futuristic copy.

## Build method
The entire repository exists from day one, but implementation progresses one module at a time. For each module complete its database changes, backend, frontend, mobile surfaces if relevant, validation, tests and acceptance checks before moving forward.

Start by reading `AGENT-START-HERE.md` and `BUILD-ORDER.md`.
