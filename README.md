# CaféCommerce — Modern Artisan Roastery Platform

CaféCommerce Stage 1: Core Authentication & Account Dashboard Engine engineered with **Remix**, **React**, **TypeScript**, **Node.js/Express**, and **PostgreSQL (Neon Serverless)**.

---

## ☕ Architecture Overview

- **Frontend**: [Remix](https://remix.run/) (v2 with Vite), React 18, TypeScript, Tailwind CSS v4, Lucide React, React Hot Toast
- **Backend API**: Node.js, Express v5.2.1, TypeScript, PostgreSQL (`pg` connection pool with SSL), JWT Authentication, bcryptjs password hashing
- **Database**: PostgreSQL (Neon Serverless)
- **Design Philosophy**: Obsidian & Warm Amber dark palette, glassmorphism, fully responsive for desktop, tablet, and mobile

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)
- A PostgreSQL database (e.g. [Neon PostgreSQL](https://neon.tech))

### 2. Installation
Install all dependencies across both the backend and Remix frontend:
```bash
npm run install:all
```

### 3. Environment Configuration

#### Backend Configuration (`backend/.env`)
```env
PORT=5000
DATABASE_URL=postgresql://user:password@your-neon-host/neondb?sslmode=require
JWT_SECRET=dev-jwt-secret-change-in-production
FRONTEND_URL=http://localhost:5173
```

#### Frontend Configuration (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```

### 4. Running the Project

Start the Express API and Remix dev servers:
- **Backend (Port 5000)**:
  ```bash
  npm run dev:backend
  ```
  *Listens on `http://localhost:5000`*

- **Frontend (Port 5173)**:
  ```bash
  npm run dev:frontend
  ```
  *Listens on `http://localhost:5173`*

---

## 🌟 Functional Pages & Endpoints

### Frontend Routes
- **`/login`**: Sign-in page with email validation, password visibility toggle, error handling, and demo account quick-fill.
- **`/dashboard`**: Protected user dashboard displaying profile details, account ID, member since date, session status, and sign-out button.
- **`/`**: Root route that automatically routes authenticated users to `/dashboard` or unauthenticated users to `/login`.

### Backend API Endpoints
- `POST /api/auth/login`: Authenticates user credentials via bcrypt, returns JWT token and sanitized public profile.
- `GET /api/auth/me`: Authenticated endpoint verifying Bearer JWT and returning the current user profile.
- `POST /api/auth/logout`: Invalidates the session on client & server.
- `GET /api/health`: Health status endpoint validating PostgreSQL database connection.

---

## 🧪 Testing & Verification

Run the automated authentication and session test suite:
```bash
npm test --prefix backend
```

Run TypeScript type checks:
```bash
npm run typecheck
```

Build the Remix production bundle:
```bash
npm run build
```

---

## 🔑 Admin Credentials

| Email | Password | Role |
|---|---|---|
| `sunny260604@gmail.com` | `123123` | Administrator |
