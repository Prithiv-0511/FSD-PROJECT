# 🚀 AnnounceHub — Internal Announcement Management SaaS Platform

A production-ready, multi-tenant SaaS platform for organizations to publish, manage, and deliver internal announcements with expiry-based visibility control, analytics, and AI-powered features.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-20-green) ![MongoDB](https://img.shields.io/badge/MongoDB-7-brightgreen) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### Core
- **Role-Based Access Control** — Admin creates/manages announcements, Employees view only active ones
- **JWT Authentication** — Access tokens (15min) + refresh token rotation (7 days)
- **Expiry Enforcement** — Expired announcements are NEVER visible to employees (cron job + query guards)
- **Multi-Tenant** — Complete data isolation between organizations

### Product
- 🏢 **Multi-Organization Support** — Each org has isolated data, users, and settings
- 🏷️ **Department Targeting** — Announcements can target specific departments
- 🔴 **Priority Levels** — Urgent, Normal, Low with visual indicators
- 📅 **Scheduling** — Schedule announcements for future publication
- ✍️ **Rich Text Editor** — Full WYSIWYG editor with images, formatting, code blocks
- 📊 **Analytics Dashboard** — View counts, engagement rates, department breakdown
- 🔔 **In-App Notifications** — Real-time notification bell with unread counts
- 🔍 **Search & Filters** — Full-text search, status/priority/department filters
- 📱 **Responsive UI** — Mobile-friendly with collapsible sidebar
- 🤖 **AI Features** — Auto-summarize, suggest titles, categorize (Google Gemini)
- 💰 **SaaS Pricing Tiers** — Free, Pro, Enterprise with feature gating

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Rich Text | React Quill |
| Charts | Recharts |
| Icons | Lucide React |
| AI | Google Gemini API |
| Notifications | react-hot-toast |

## 📁 Project Structure

```
├── server/                     # Backend API
│   ├── config/                 # DB and env configuration
│   ├── controllers/            # Business logic (7 controllers)
│   ├── middleware/              # Auth, RBAC, tenant scope, error handler
│   ├── models/                 # Mongoose models (6 models)
│   ├── routes/                 # Express routes (7 route files)
│   ├── jobs/                   # Cron jobs (expiry, scheduler)
│   ├── seed.js                 # Database seeder
│   └── server.js               # Entry point
│
├── client/                     # Frontend SPA
│   └── src/
│       ├── api/                # Axios instance with JWT interceptors
│       ├── context/            # Auth context (React Context)
│       ├── components/         # Reusable components
│       │   └── layout/         # Sidebar, Header, Layout
│       └── pages/              # Route pages
│           ├── admin/          # Dashboard, Announcements, Users, etc.
│           └── employee/       # Feed, Detail, Profile
│
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **MongoDB** running locally (or MongoDB Atlas URI)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# Copy the example env file
cp server/.env.example server/.env

# Edit with your MongoDB URI (default: localhost:27017)
```

### 3. Seed Demo Data

```bash
cd server
npm run seed
```

This creates:
- **Organization**: Acme Corporation (Pro plan)
- **Admin**: `admin@acme.com` / `admin123`
- **Employee**: `employee@acme.com` / `employee123`
- **4 Departments**: Engineering, HR, Marketing, Finance
- **6 Sample Announcements** (active, scheduled, expired)
- **Sample Notifications**

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register org + admin |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Announcements
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/announcements` | Create (admin) |
| GET | `/api/announcements` | List (filtered by role) |
| GET | `/api/announcements/:id` | Get detail + track view |
| PUT | `/api/announcements/:id` | Update (admin) |
| DELETE | `/api/announcements/:id` | Delete (admin) |
| POST | `/api/announcements/:id/publish` | Publish (admin) |
| GET | `/api/announcements/:id/analytics` | View analytics (admin) |

### Users, Org, Notifications, Analytics, AI
Full API docs available at the endpoints above.

## 💰 Pricing Tiers

| Feature | Free | Pro ($12/mo) | Enterprise |
|---------|------|-------------|------------|
| Users | 10 | 100 | Unlimited |
| Announcements/mo | 20 | Unlimited | Unlimited |
| Departments | 3 | Unlimited | Unlimited |
| AI Features | ❌ | ✅ | ✅ |
| Scheduling | ❌ | ✅ | ✅ |
| Email Notifications | ❌ | ✅ | ✅ |
| Analytics | Basic | Full | Full + Export |

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

## 📄 License

MIT License
