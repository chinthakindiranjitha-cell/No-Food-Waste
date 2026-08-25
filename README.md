# No Food Waste Connect 🍲

"No Food Waste Connect" is a MERN stack web application built to connect food donors/requesters, volunteers, and administrators to minimize food waste and distribute surplus food efficiently.

---

## 📁 Project Structure

```
FoodWastageApp/
├── .env.example            # Environment variables template
├── package.json            # Root scripts for running client & server concurrently
├── README.md               # Setup and usage documentation
├── server/                 # Express + Mongoose Backend
│   ├── config/             # DB connection logic
│   ├── controllers/        # Auth and request business logic
│   ├── middleware/         # JWT Auth & Role check middlewares
│   ├── models/             # Mongoose Schemas (User, FoodRequest, Assignment)
│   ├── routes/             # API Endpoints (/api/auth)
│   └── server.js           # Server entry point
└── client/                 # React + Vite + Tailwind CSS Frontend
    ├── src/
    │   ├── components/     # UI Components (StatusBadge, EmptyState, LoadingState, etc.)
    │   ├── context/        # Auth Context & Provider
    │   ├── pages/          # Pages (Login, Register, Dashboard)
    │   ├── services/       # Axios API client setup
    │   ├── App.jsx         # App Routing
    │   └── index.css       # Tailwind CSS styles
```

---

## 🚀 Quick Start Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)

### 1. Environment Setup
Copy `.env.example` to `server/.env` (or set environment variables):
```bash
cp .env.example server/.env
```
Ensure `MONGO_URI` points to your running MongoDB instance and `JWT_SECRET` is set.

### 2. Installation
Install all dependencies (root, server, client):
```bash
npm run install-all
```
*Or install manually:*
```bash
# Install root tools
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Running the App locally

#### Option A: Run Both Client & Server Concurrently
From the root directory:
```bash
npm run dev
```

#### Option B: Run Separately
- **Backend**: `cd server && npm run dev` (Runs on `http://localhost:5000`)
- **Frontend**: `cd client && npm run dev` (Runs on `http://localhost:5173`)

---

## 🔐 API Reference (Auth Scaffold)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register` | Register a new user (`requester`, `volunteer`, `admin`) | Public |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT | Public |
| `GET` | `/api/auth/me` | Fetch current user profile | Protected (JWT) |

---

## 🎨 Design & Persona Principles
- **Requester**: Simple form submitting food details in under a minute.
- **Volunteer**: Mobile-first scan & action flow for food assignments.
- **Admin**: Fast scanning view to manage requests with minimal clicks.
- **Visuals**: Warm, approachable tone, soft rounded corners (`rounded-2xl`, `rounded-xl`), color-coded status badges:
  - `pending` (Yellow)
  - `accepted` (Blue)
  - `assigned` (Purple)
  - `collected` (Orange)
  - `delivered` (Green)
