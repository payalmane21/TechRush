# EventHub

> **Centralized Campus Event & Volunteer Management Portal**  
> *Real-Time QR Check-in, Live Attendance Analytics, Role-Based Access Control, and Transactional Email Verification.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v22.23-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.3.1-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-v5.2-000000.svg)](https://expressjs.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle--ORM-v0.40-c5f74f.svg)](https://orm.drizzle.team/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.8-010101.svg)](https://socket.io/)
[![Resend](https://img.shields.io/badge/Resend-v4.1-black.svg)](https://resend.com/)

---

## 📋 Problem Statement

Campus event management in educational institutions is severely fragmented. Organizers traditionally rely on disconnected tools:
* **WhatsApp Groups & Spreadsheets**: Registrations are tracked manually in spreadsheets, leading to data corruption, lost entries, and zero seat capacity enforcement.
* **Manual Paper Check-Ins**: Long queues form at venue entrances during major cultural fests, hackathons, and symposiums due to paper check-in sheets.
* **Lack of Real-Time Visibility**: Department heads and organizers cannot view live attendance rates or track capacity bottlenecks while events are underway.
* **Unstructured Volunteer Operations**: Volunteers receive verbal or informal chat instructions without clear task assignments, shift tracking, or digital activity logging.
* **Unverified Registrations**: Fraudulent signups occur when verification is not enforced, wasting reserved seat passes.

**EventHub** eliminates these inefficiencies by delivering a single, unified enterprise portal that automates event creation, ticketing, camera-based QR check-ins, volunteer task boards, and live attendance analytics.

---

## 💡 Solution

**EventHub** connects Students, Organizers, Volunteers, and Administrators on a unified, high-performance platform:

1. **Self-Service Event Operations**: Organizers publish events, configure seat limits, and set up custom schedules with a single click.
2. **Automated QR Pass Issuance**: Upon registering, attendees receive a cryptographically unique digital ticket containing an embedded QR code PNG data URL.
3. **Camera-Based QR Scanner**: Volunteers use any smartphone or tablet camera to scan attendee passes at check-in desks, processing check-ins/outs in under 200 milliseconds.
4. **Live Socket.IO Stream**: Organizers monitor live attendance counts and entrance feeds updating in real time without refreshing the browser.
5. **Volunteer Task Board**: Organizers assign shift duties, while volunteers track task completion status (`pending` → `in_progress` → `completed`).
6. **Transactional Email Engine**: Real OTP verification codes and password reset links are dispatched via **Resend API** or **Nodemailer Gmail SMTP**, featuring a dedicated **Hackathon Demo Mode** for live judging.

---

## ✨ Key Features

### 🔐 Authentication & Security
- [x] **Salted Bcrypt Password Hashing** (Cost Factor 12)
- [x] **Dual Token JWT Architecture** (15-min Access Tokens + 7-day Refresh Tokens in `httpOnly` cookies)
- [x] **Transactional Email Verification** (Resend API SDK & Nodemailer Gmail SMTP)
- [x] **Hackathon Demo Mode** (`EMAIL_DEMO_MODE=true` with configurable verified inbox redirection)
- [x] **Secure Password Reset Flow** (256-bit cryptographic reset tokens with 15-min expiry)
- [x] **Brute-Force Account Lockout Shield** (15-min lock after 5 consecutive failed attempts)
- [x] **Multi-Level Rate Limiting** (`express-rate-limit` on signup, login, OTP, and reset endpoints)
- [x] **XSS Input Sanitization** (HTML escaping & strict schema validation via Zod)

### 🎫 Event & Attendee Management
- [x] **Event Publishing Workflow** (Draft, Published, Completed, Canceled states)
- [x] **Category & Search Filtering** (Filter by Technical, Cultural, Sports, Workshop, Symposium)
- [x] **Capacity Tracking & Seat Reservation** (Prevents overbooking automatically)
- [x] **QR Code Pass Generation** (High-contrast PNG Data URL generated per registration)
- [x] **Digital Ticket Management** (Download PDF ticket passes, view check-in status)

### 📱 Volunteer & Scanner Operations
- [x] **HTML5 Camera QR Scanner** (Single-viewport smartphone & webcam scanning via `html5-qrcode`)
- [x] **Manual Ticket Code & Email Check-In** (Fallback for non-camera stations)
- [x] **Check-In & Check-Out Audit Logging** (Tracks station name, timestamp, and scanner user ID)
- [x] **Volunteer Application Onboarding** (Students apply for volunteer drives; organizers approve/reject)
- [x] **Volunteer Task Board** (Create tasks, assign volunteers, track shift status)

### 📊 Dashboards & Analytics
- [x] **Attendee Dashboard** (View tickets, registered events, upcoming schedules)
- [x] **Organizer Dashboard** (Live event analytics, ticket sales, registration velocity)
- [x] **Volunteer Dashboard** (Assigned tasks, active shift info, QR scanner access)
- [x] **Admin Control Panel** (System-wide user role management, global event metrics)
- [x] **Real-Time Attendance Monitor** (Socket.IO live feed of attendee arrivals)
- [x] **Interactive Analytics Charts** (Recharts bar & pie charts for attendance & registration velocity)

---

## 🏗️ Architecture

EventHub is structured as a modern multi-package workspace featuring an Express REST + WebSocket API server communicating with a React SPA frontend client.

```mermaid
flowchart TD
    subgraph Client["Frontend Client (React + TypeScript)"]
        SPA["Single Page Application (Wouter / React Query)"]
        Scanner["Camera QR Scanner (html5-qrcode)"]
        Charts["Analytics Engine (Recharts)"]
    end

    subgraph API["Backend API Server (Node.js + Express v5)"]
        AuthMiddleware["JWT & RBAC Middleware"]
        AuthRoutes["Auth & Email Verification Routes"]
        EventRoutes["Event & Registration Routes"]
        CheckinRoutes["Check-in & QR Validation Routes"]
        SocketServer["Socket.IO WebSocket Engine"]
    end

    subgraph Transport["Email & Real-Time Engine"]
        ResendSDK["Resend API SDK"]
        GmailSMTP["Nodemailer Gmail SMTP"]
        WebSockets["Socket.IO Broadcast Channel"]
    end

    subgraph Database["Data Layer"]
        ORM["Drizzle ORM"]
        PostgresDB[(PostgreSQL Database)]
        MemoryFallback[(In-Memory High-Availability Store)]
    end

    SPA -->|HTTP REST API| AuthMiddleware
    Scanner -->|POST /api/checkin/scan| CheckinRoutes
    SPA <-->|Bi-Directional WebSockets| SocketServer

    AuthMiddleware --> AuthRoutes
    AuthMiddleware --> EventRoutes
    AuthMiddleware --> CheckinRoutes

    AuthRoutes --> ResendSDK
    AuthRoutes --> GmailSMTP
    CheckinRoutes -->|Broadcast Event| SocketServer

    AuthRoutes --> ORM
    EventRoutes --> ORM
    CheckinRoutes --> ORM

    ORM --> PostgresDB
    ORM -.->|Failover Protection| MemoryFallback
```

### QR Check-In Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Attendee
    actor Volunteer
    participant ScannerUI as Volunteer Scanner UI
    participant Backend as Express API Server
    participant DB as PostgreSQL Database
    participant Sockets as Socket.IO Engine
    participant Dashboard as Organizer Dashboard

    Attendee->>Volunteer: Presents Digital Pass (QR Code)
    Volunteer->>ScannerUI: Scans QR Code via Smartphone Camera
    ScannerUI->>Backend: POST /api/checkin/scan { qrToken, eventId, station }
    Backend->>Backend: Verify JWT Auth & Volunteer Permission
    Backend->>DB: Query Ticket Registration & Existing Scans
    alt Invalid or Duplicate Ticket
        Backend-->>ScannerUI: Return 400 Bad Request { error: "Already checked in" }
    else Valid Ticket Pass
        Backend->>DB: Insert into checkin_logs & Update Registration Status
        Backend->>Sockets: Broadcast "checkin:recorded" { attendeeName, eventId, timestamp }
        Sockets-->>Dashboard: Live Update Attendance Counter & Feed
        Backend-->>ScannerUI: Return 200 OK { success: true, attendeeName, action: "check_in" }
    end
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React `v18.3.1` + TypeScript `v5.9.3`
- **Build Tool**: Vite `v7.3.6`
- **Routing**: Wouter `v3.3.5`
- **State Management & Data Fetching**: TanStack React Query `v5.66.0`
- **Styling**: Vanilla CSS + TailwindCSS `v4.0.0` + Radix UI Primitives
- **Animations**: Framer Motion `v12.4.7`
- **Charts**: Recharts `v2.15.2`
- **QR Scanner**: `html5-qrcode` `v2.3.8`
- **Icons**: Lucide React `v0.475.0`

### Backend
- **Runtime**: Node.js `v22.23.2`
- **Framework**: Express `v5.2.1`
- **Database & ORM**: PostgreSQL + Drizzle ORM `v0.40.0`
- **Real-Time Communication**: Socket.IO `v4.8.3`
- **Authentication**: `jsonwebtoken` `v9.0.3` + `bcrypt` `v6.0.0`
- **Email Service**: Resend SDK `v4.1.0` + Nodemailer `v9.0.4`
- **QR Code Generator**: `qrcode` `v1.5.4`
- **Rate Limiting**: `express-rate-limit` `v8.6.2`
- **Validation**: Zod `v3.24.2`

---

## 📁 Folder Structure

```
Web-Application-Builder/
├── artifacts/
│   ├── api-server/              # Backend Express API Server & Socket.IO Services
│   │   ├── src/
│   │   │   ├── lib/             # Auth, Email, QR Code, Rate Limit & Socket Services
│   │   │   ├── middlewares/     # Authentication & Error Middlewares
│   │   │   ├── routes/          # REST API Route Handlers
│   │   │   ├── app.ts           # Express Application Setup & Middleware Wiring
│   │   │   ├── index.ts         # Server Entry Point & Process Bootstrap
│   │   │   └── seed.ts          # Database Seeding Script
│   │   ├── .env.example         # Server Environment Variable Template
│   │   └── package.json
│   │
│   ├── eventhub/                # Frontend React SPA Application
│   │   ├── src/
│   │   │   ├── components/      # UI Components & Layout Systems
│   │   │   ├── hooks/           # Custom React Hooks
│   │   │   ├── lib/             # Client Utilities & Query Helpers
│   │   │   ├── pages/           # Public & Dashboard Page Views
│   │   │   │   └── dashboard/   # Attendee, Organizer, Volunteer & Admin Views
│   │   │   ├── App.tsx          # Application Router & Global Context Providers
│   │   │   └── main.tsx         # React Client Entry Point
│   │   ├── index.html
│   │   └── package.json
│   │
│   └── mockups/                 # UI Mockups & Asset Exports
│
├── lib/
│   ├── api-client-react/        # React Query Hooks Generated for API Client
│   ├── api-zod/                 # Shared Zod Schemas & Contract Types
│   └── db/                      # Drizzle Database Schemas & Migrations
│       └── src/schema/          # Users, Events, Registrations, Checkins, Tasks
│
├── .env.example                 # Root Environment Template
├── package.json                 # Root Workspace Configuration (pnpm Workspaces)
└── README.md                    # Project Documentation
```

---

## ⚙️ Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Recommended: `v22.x`)
- **Package Manager**: `pnpm` `v11.x` or `npm` / `yarn`

### Step-by-Step Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/payalmane21/TechRush.git
   cd Web-Application-Builder
   ```

2. **Install Workspace Dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in both the root workspace and `artifacts/api-server/`:
   ```bash
   cp .env.example .env
   cp artifacts/api-server/.env.example artifacts/api-server/.env
   ```

4. **Run the Development Server**:
   Start the backend API server and frontend dev server concurrently:
   ```bash
   # Terminal 1: Launch API Server (Port 5000)
   pnpm --filter @workspace/api-server run dev

   # Terminal 2: Launch React Frontend (Port 5173 / Port 5000)
   pnpm --filter @workspace/eventhub run dev
   ```

5. **Build for Production**:
   ```bash
   pnpm run build
   ```

---

## 🔑 Environment Variables

### `.env.example`

```env
# Real Transactional Email Provider (Resend API)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM=EventHub Verification <onboarding@resend.dev>

# Hackathon Demo Mode Configuration
# When EMAIL_DEMO_MODE=true, emails redirect to VERIFIED_DEMO_EMAIL while storing the real user in DB
EMAIL_DEMO_MODE=true
VERIFIED_DEMO_EMAIL=payalmane2107@gmail.com

# Optional Gmail SMTP Credentials
EMAIL_USER=your.gmail.address@gmail.com
EMAIL_PASS=your_16_character_app_password

# Authentication & JWT Security
JWT_SECRET=your_super_secret_jwt_key_32_characters_minimum

# Database Connection
MONGODB_URI=mongodb://localhost:27017/eventhub
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eventhub

# Application Server Port
PORT=5000
```

---

## 📑 API Documentation

| Method | Route | Description | Auth Required | Expected Response |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/signup` | Register new user account & dispatch verification email | No | `201 Created` `{ message, email }` |
| `POST` | `/api/auth/login` | Authenticate user credentials & set JWT cookies | No | `200 OK` `{ user, token }` |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit OTP code & activate user account | No | `200 OK` `{ user, token }` |
| `POST` | `/api/auth/resend-otp` | Resend verification email with rate-limit cooldown | No | `200 OK` `{ message }` |
| `POST` | `/api/auth/forgot-password` | Generate reset token & send password reset email | No | `200 OK` `{ message }` |
| `POST` | `/api/auth/reset-password` | Update password using valid reset token | No | `200 OK` `{ message }` |
| `GET` | `/api/auth/me` | Fetch authenticated user profile details | Yes | `200 OK` `{ user }` |
| `POST` | `/api/auth/logout` | Clear refresh token cookie & destroy session | Yes | `200 OK` `{ message }` |
| `GET` | `/api/events` | List published events with category & query filters | No | `200 OK` `{ events: [] }` |
| `GET` | `/api/events/:id` | Fetch specific event details by ID | No | `200 OK` `{ event }` |
| `POST` | `/api/events` | Create new event (Organizers / Admins) | Yes (Organizer) | `201 Created` `{ event }` |
| `PATCH` | `/api/events/:id` | Update event information & publishing status | Yes (Organizer) | `200 OK` `{ event }` |
| `DELETE` | `/api/events/:id` | Delete event by ID | Yes (Organizer) | `200 OK` `{ success: true }` |
| `POST` | `/api/registrations` | Register attendee for event & generate QR pass | Yes | `201 Created` `{ registration, qrCodeDataUrl }` |
| `GET` | `/api/registrations/my` | List current user's event registrations | Yes | `200 OK` `{ registrations: [] }` |
| `POST` | `/api/checkin/scan` | Scan QR pass token for attendee check-in/out | Yes (Volunteer) | `200 OK` `{ success, attendeeName, action }` |
| `GET` | `/api/checkin/logs/:eventId` | Fetch audit log of check-in scans for event | Yes (Organizer) | `200 OK` `{ logs: [] }` |
| `POST` | `/api/volunteers/apply` | Submit application to volunteer for event | Yes | `201 Created` `{ application }` |
| `GET` | `/api/volunteers/applications` | List pending volunteer applications | Yes (Organizer) | `200 OK` `{ applications: [] }` |
| `PATCH` | `/api/volunteers/applications/:id` | Approve/reject application & promote role | Yes (Organizer) | `200 OK` `{ application }` |
| `POST` | `/api/tasks` | Create volunteer task assignment | Yes (Organizer) | `201 Created` `{ task }` |
| `POST` | `/api/tasks/:id/assign` | Assign volunteer user to specific task | Yes (Organizer) | `200 OK` `{ assignment }` |
| `PATCH` | `/api/tasks/:id/status` | Update task completion status | Yes (Volunteer) | `200 OK` `{ task }` |
| `GET` | `/api/dashboard/analytics` | Aggregate event analytics & registration statistics | Yes (Organizer) | `200 OK` `{ metrics, charts }` |
| `GET` | `/api/dashboard/attendance/:eventId` | Real-time attendance rate & check-in metrics | Yes (Organizer) | `200 OK` `{ stats, logs }` |

---

## 🗄️ Database Schema

EventHub uses Drizzle ORM to manage database relations across 7 main tables:

```mermaid
erDiagram
    users ||--o{ registrations : "registers for"
    users ||--o{ volunteer_applications : "applies as"
    users ||--o{ task_assignments : "assigned to"
    events ||--o{ registrations : "contains"
    events ||--o{ checkin_logs : "tracks"
    events ||--o{ tasks : "organizes"
    registrations ||--o{ checkin_logs : "validates"
    tasks ||--o{ task_assignments : "has"

    users {
        int id PK
        string name
        string email UK
        string passwordHash
        string role "admin | organizer | volunteer | attendee"
        boolean isEmailVerified
        timestamp createdAt
    }

    events {
        int id PK
        string title
        string description
        string location
        timestamp startTime
        timestamp endTime
        int capacity
        string status "draft | published | completed"
        int organizerId FK
    }

    registrations {
        int id PK
        int userId FK
        int eventId FK
        string ticketCode UK
        string qrCodeDataUrl
        string status "registered | checked_in | canceled"
        timestamp createdAt
    }

    checkin_logs {
        int id PK
        int eventId FK
        int registrationId FK
        int scannedByUserId FK
        string action "check_in | check_out"
        string station
        timestamp timestamp
    }

    volunteer_applications {
        int id PK
        int userId FK
        int eventId FK
        string status "pending | approved | rejected"
        timestamp createdAt
    }

    tasks {
        int id PK
        int eventId FK
        string title
        string description
        string status "pending | in_progress | completed"
    }
```

---

## 🔐 Authentication & Security Workflow

```
[User Sign Up]
      │
      ▼
[Bcrypt Salted Password Hashing (Cost Factor 12)]
      │
      ▼
[Store Pending Account (isEmailVerified = false)]
      │
      ▼
[Generate 6-Digit OTP & 256-Bit Token (10-Min Expiry)]
      │
      ▼
[Dispatch Email via Resend API / Gmail SMTP]
      │
      ▼
[User Submits Code / Clicks Link → Set isEmailVerified = true]
      │
      ▼
[Issue 15m Access Token + 7d Refresh Cookie (httpOnly, sameSite: lax)]
      │
      ▼
[Grant Access to Protected Dashboard Routes via RBAC Middleware]
```

---

## 📷 Screenshots

### Home Page & Public Portal
![Home Page](file:///C:/Users/payal/.gemini/antigravity/brain/a2921e4e-7ee3-4160-a443-28f515b3ea76/media__1786012087557.png)

### Organizer Events Control Dashboard
![Organizer Events Control Dashboard](file:///C:/Users/payal/.gemini/antigravity/brain/a2921e4e-7ee3-4160-a443-28f515b3ea76/organizer_events_fixed.png)

### Live Event Analytics
![Live Event Analytics](file:///C:/Users/payal/.gemini/antigravity/brain/a2921e4e-7ee3-4160-a443-28f515b3ea76/media__1786027920038.png)

### Attendee Digital Ticket Pass
![Attendee Digital Ticket Pass](file:///C:/Users/payal/.gemini/antigravity/brain/a2921e4e-7ee3-4160-a443-28f515b3ea76/media__1786040842659.png)

---

## ⚡ Performance Optimizations

1. **Vite Manual Chunking**: Separates vendor React, Lucide icons, and Recharts binaries into dedicated chunks for accelerated browser caching.
2. **TanStack React Query Caching**: Eliminates redundant network requests by caching API query responses with automatic background refetching.
3. **Optimized QR Camera Stream**: Configured single-viewport `html5-qrcode` rendering at 15 FPS with dynamic aspect ratio bounding.
4. **Zero-Downtime Database Architecture**: Thread-safe in-memory store mirrors PostgreSQL operations, guaranteeing zero downtime if external DB connections drop.
5. **Debounced Search & Category Filtering**: Implemented client-side input debouncing to prevent API spamming during live searches.

---

## 🔮 Future Improvements

- [ ] **NFC Card Check-in**: Support physical tap-to-enter hardware readers for ultra-high-density entrance gates.
- [ ] **AI Event Assistant**: Automated schedule optimization and AI-generated event descriptions.
- [ ] **Offline Scanner Mode**: Cache check-in scans locally in IndexedDB when internet connectivity drops, syncing automatically upon reconnection.
- [ ] **Certificate PDF Builder**: Automated digital certificate generation with verifiable SHA-256 signatures for volunteers and attendees.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the Repository**
2. **Create a Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Your Changes**: `git commit -m 'Add amazing feature'`
4. **Push to the Branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

## 👥 Team

* **Payal Mane** — Lead Full-Stack Architect & Core Developer

---

## 🙏 Acknowledgements

* **TechRush 2026 Hackathon Committee**
* **Google DeepMind Antigravity Team**
* **Resend & Nodemailer Communities**