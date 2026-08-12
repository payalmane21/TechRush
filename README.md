# EventHub

> **Centralized Event, Attendee, Organizer, Admin and Volunteer Management Platform.**  
> *A unified collegiate platform delivering complete event lifecycles, administrative governance, cryptographic QR ticketing, Razorpay payment verification, AI-powered volunteer matching, attendee concierge chatbot with event mascots, and multi-device real-time collaboration.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.3.1-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-v7.3-646CFF.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-v5.0-000000.svg)](https://expressjs.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle--ORM-v0.40-c5f74f.svg)](https://orm.drizzle.team/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.8-010101.svg)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)

---

## 1. Project Overview

**EventHub** is a centralized, end-to-end event management platform engineered to connect **Administrators**, **Organizers**, **Attendees**, and **Volunteers** within a single, secure environment. 

The platform oversees the complete event lifecycle: from event proposal, drafting, and administrative governance to ticket registration, secure payment processing, camera-based QR attendance tracking, AI-assisted volunteer recruitment, thematic AI concierge assistance, and multi-device real-time team coordination.

---

## 2. Problem Statement

Collegiate and institutional event operations are traditionally fragmented across disconnected spreadsheets, paper lists, and unstructured messaging groups:

* **Fragmented Event Management**: Organizers, campus clubs, and administrators use disparate tools without a single source of truth.
* **Manual Registration & Capacity Overruns**: Registrations tracked on external forms lead to lost entries, unverified claims, and accidental overbooking.
* **Difficult Attendance Tracking & Long Gate Queues**: Paper sign-in sheets cause delays and make duplicate check-in prevention impossible.
* **Lack of Centralized Volunteer Management**: Volunteers are recruited through informal chats without skill alignment, duty tracking, or shift verification.
* **Delayed Event Approval & Governance Gaps**: Event proposals lack formal administrative review, audit trails, and status visibility.
* **Poor Visibility of Registrations & Revenue**: Department heads cannot track live ticket registrations, fee collections, or gate check-in velocity.
* **Lack of Intelligent Volunteer Allocation**: Organizers struggle to match volunteer applications to technical and operational requirements.
* **Limited Attendee Assistance**: Students lack real-time answers regarding venue locations, schedules, entry fees, and digital passes.
* **Lack of Real-Time Coordination**: Multi-member event teams cannot coordinate live on event day without manual dashboard refreshing.

**EventHub solves these challenges** by unifying event governance, payments, attendance, intelligence, and communication in one real-time platform.

---

## 3. Key Features

### 📅 Event Management
* **Event Creation & Editing**: Organizers configure titles, descriptions, categories, venues, timestamps, capacities, pricing, rules, and banner visuals.
* **Governance Submission**: One-click event submission for institutional administrative review.
* **Admin Review & Approval/Rejection**: Administrators review event details and approve or reject with custom feedback.
* **Event Publishing**: Organizers publish approved events live to the public catalog.
* **Complete Lifecycle Tracking**: Full state machine management (`Draft` $\rightarrow$ `Pending Approval` $\rightarrow$ `Approved` $\rightarrow$ `Published` $\rightarrow$ `Closed` / `Rejected`).

### 🎟️ Attendee Management
* **Event Discovery**: Search and filter upcoming events by category (*Technology, Cultural, Sports, Academic, Business, Social*).
* **Comprehensive Registration**: Complete registration forms capturing student name, college, email, and phone number.
* **Free & Paid Event Workflows**: Instant free student passes or secure checkout for paid masterclasses.
* **Cryptographic QR Tickets**: Unique QR pass generation for every confirmed registration with fraud-proof verification tokens.
* **Attendee Dashboard**: Dedicated portal to access confirmed passes, event schedules, and payment receipts.

### 💳 Payments & Financial Tracking
* **Razorpay Payment Gateway Integration**: Seamless checkout supporting UPI, Credit/Debit Cards, and NetBanking.
* **Cryptographic Server-Side Verification**: Verification of payment IDs, order IDs, and HMAC-SHA256 signatures before confirming tickets.
* **Instant Ticket Issuance**: Registrations are confirmed only after verified payment capture.
* **Live Revenue Tracking**: Real-time revenue metrics on Organizer and Admin dashboards.
* **University Payment Ledger**: Immutable ledger of confirmed transactions.

### 📷 QR Code & Attendance Tracking
* **HTML5 Camera QR Scanner**: In-browser camera scanning on any smartphone or tablet for volunteers.
* **Manual Code / Email Fallback**: Manual check-in options for non-camera stations.
* **Duplicate Check-In Prevention**: Rejects already scanned tickets and provides visual warning badges.
* **Check-In & Check-Out Auditing**: Timestamps and volunteer scanner IDs recorded for every gate action.
* **Live Attendance Analytics**: Real-time progress bars showing current venue check-in percentages.

### 🤖 AI Capabilities
* **Attendee-Only AI Chatbot**: Interactive campus concierge answering questions about event schedules, fees, venues, and passes.
* **Event-Grounded Intelligence**: AI retrieves authentic database information to answer event-specific questions accurately.
* **AI Event Mascot Studio**: 1-click collegiate character synthesis generating SVG mascot visuals, personality bios, and generative prompts.
* **Predefined Thematic Styling**: Automatic theme adaptation (*Tech, Sports, Cultural, Academic, Business, Entertainment, General*) matching the viewed event.
* **AI-Powered Volunteer Matching**: Evaluates volunteer skills, experience, and uploaded resumes against event requirements to compute match scores and recommendations.

### 🤝 Volunteer Management
* **Volunteer Applications**: Students apply for volunteer drives, submitting skills, experience, and resumes.
* **Requirement Definitions**: Organizers define required skills, responsibilities, and required headcount.
* **Ranked AI Recommendations**: Organizers review skill alignment scores before making final assignments.
* **Assignment Notifications**: Instant notifications dispatched to volunteers upon selection.
* **Volunteer Dashboard**: Dedicated interface with assigned duties, active shifts, and QR gate scanner access.

### ⚡ Real-Time Collaboration
* **Live WebSocket (Socket.IO) Synchronization**: Instant cross-device updates for approvals, registrations, payments, and gate arrivals.
* **Cross-Tab BroadcastChannel Sync**: Instant client-side state hydration across browser tabs.
* **Real-Time Group Chat**: Dedicated live team chatroom connecting Admin, Organizer, Attendee, and Volunteer accounts.
* **Notification Stream**: Instant alerts for event approvals, volunteer assignments, and confirmed payments.

### 📊 Role-Specific Dashboards
* **Admin Dashboard**: System-wide event approvals, platform user metrics, gross revenue, and attendance audits.
* **Organizer Dashboard**: Event drafting, mascot studio, volunteer matching, live check-in meters, and revenue stats.
* **Attendee Dashboard**: Active ticket passes, full-screen QR pass viewer, and payment transaction history.
* **Volunteer Dashboard**: Active volunteer assignments, duty instructions, and camera QR verification terminal.

---

## 4. User Roles & Capabilities

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                    EVENTHUB PLATFORM                                     │
└──────────────┬───────────────────┬──────────────────────────┬────────────────────────────┘
               │                   │                          │                            │
               ▼                   ▼                          ▼                            ▼
        ┌──────────────┐   ┌──────────────┐            ┌──────────────┐             ┌──────────────┐
        │    ADMIN     │   │  ORGANIZER   │            │   ATTENDEE   │             │  VOLUNTEER   │
        └──────┬───────┘   └──────┬───────┘            └──────┬───────┘             └──────┬───────┘
               │                   │                          │                            │
               ├─ Review Events    ├─ Create / Edit Events    ├─ Browse Events             ├─ Apply to Events
               ├─ Approve / Reject ├─ Submit for Approval     ├─ Use AI Chatbot            ├─ Submit Skills/CV
               ├─ Platform Stats   ├─ Publish Live Events     ├─ Register (Free/Paid)      ├─ View AI Assignment
               ├─ Monitor Revenue  ├─ AI Mascot Studio        ├─ Access QR Pass            ├─ Scan Gate QR
               └─ Audit Check-ins  ├─ AI Volunteer Matching   └─ View Tickets              └─ Log Check-ins
                                   └─ Track Attendance
```

| Role | Primary Responsibilities | Key Dashboard Views |
| :--- | :--- | :--- |
| **ADMIN** | Reviews submitted events, enforces institutional guidelines, approves/rejects event proposals, monitors gross university revenue, and audits global attendance metrics. | `/dashboard/admin`, `/dashboard/admin/approvals`, `/dashboard/messages` |
| **ORGANIZER** | Drafts events, generates AI mascots, submits events for review, publishes approved events, defines volunteer needs, uses AI matching, assigns volunteers, and monitors live check-ins. | `/dashboard/organizer`, `/dashboard/organizer/events/new`, `/dashboard/organizer/volunteers`, `/dashboard/messages` |
| **ATTENDEE** | Discovers published events, consults the event-grounded AI chatbot, registers for free/paid passes, completes Razorpay checkout, and accesses digital QR tickets. | `/events`, `/events/:id`, `/dashboard/attendee`, `/dashboard/messages` |
| **VOLUNTEER** | Applies for volunteer drives with skills/experience, reviews assigned duty roles, checks in attendees using camera QR scanner, and tracks shift credit hours. | `/dashboard/volunteer`, `/dashboard/volunteer/scanner`, `/dashboard/messages` |

---

## 5. Event Approval Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Org as Organizer
    actor Admin as Administrator
    actor Att as Attendee
    
    Org->>Org: 1. Creates Event Draft (Title, Venue, Date, Capacity, Price, Mascot)
    Org->>Admin: 2. Submits Event for Administrative Review
    Note over Admin: Admin receives real-time notification
    Admin->>Admin: 3. Reviews Event Details, Schedule & Safety Guidelines
    alt Event Approved
        Admin-->>Org: 4a. Event Approved (Status: approved)
        Org->>Org: 5. Publishes Event Live
        Note over Att: 6. Event appears in Public Catalog
    else Event Rejected
        Admin-->>Org: 4b. Event Rejected with Reason (Status: rejected)
        Org->>Org: Edits & Re-submits Draft
    end
```

---

## 6. Registration & Payment Flow

```mermaid
flowchart TD
    A[Attendee Selects Event] --> B[Clicks Register]
    B --> C[Enters Student Information]
    C --> D{Is Event Free or Paid?}
    
    D -->|Free Event ₹0| E[Instant Confirmation]
    E --> F[Generate Signed QR Ticket]
    
    D -->|Paid Event > ₹0| G[Create Razorpay Order]
    G --> H[Attendee Completes Razorpay Checkout]
    H --> I[Backend Verifies HMAC-SHA256 Signature]
    I --> J{Signature Valid?}
    
    J -->|Yes| K[Record Payment in Ledger]
    K --> L[Confirm Registration]
    L --> F
    
    J -->|No| M[Reject Transaction & Log Warning]
```

> [!IMPORTANT]
> Paid event registrations are **confirmed strictly after server-side cryptographic signature verification** via `POST /api/payments/verify`. Unverified or forged client payloads are rejected.

---

## 7. Real-Time Architecture

EventHub incorporates a real-time event pipeline powered by **Socket.IO** and **Browser BroadcastChannel** to synchronize state across connected devices without requiring page refreshes:

```mermaid
flowchart LR
    subgraph Server["EventHub Backend API"]
        SocketEngine["Socket.IO Server Engine"]
    end

    subgraph Clients["Connected Live Devices"]
        AdminDevice["Device 1: Admin Dashboard"]
        OrgDevice["Device 2: Organizer Dashboard"]
        AttDevice["Device 3: Attendee Portal"]
        VolDevice["Device 4: Volunteer Scanner"]
    end

    SocketEngine <-->|"event_approved"| OrgDevice
    SocketEngine <-->|"registration_created"| OrgDevice
    SocketEngine <-->|"payment_confirmed"| AdminDevice
    SocketEngine <-->|"volunteer_assigned"| VolDevice
    SocketEngine <-->|"attendance_updated"| OrgDevice
    SocketEngine <-->|"new_chat_message"| AdminDevice & OrgDevice & AttDevice & VolDevice
```

* **Live Registration Feed**: Organizer and Admin dashboards update capacity meters as attendees register.
* **Instant Revenue Sync**: Payment captures immediately update financial metrics on administrative screens.
* **Approval Notifications**: Organizers receive instant alerts when admins approve proposals.
* **Volunteer Assignment Alerts**: Volunteers receive instant push notices when selected for duty.
* **Gate Attendance Stream**: Entrance check-ins update check-in counters in real time.
* **Real-Time Group Chat**: All four authenticated accounts communicate with zero-latency delivery.

---

## 8. AI Volunteer Matching System

```mermaid
flowchart TD
    subgraph Input["Application Data"]
        V1["Volunteer Profile & Bio"]
        V2["Technical / Operational Skills"]
        V3["Past Experience & Hours"]
        V4["Resume / CV Text"]
    end

    subgraph Requirements["Event Needs"]
        R1["Organizer Skill Requirements"]
        R2["Headcount & Shift Slots"]
    end

    Input & Requirements --> Engine["AI Contextual Match Engine"]
    Engine --> Ranked["Ranked Recommendations with Match % & Skill Gap Analysis"]
    Ranked --> Review["Organizer Reviews Recommendations"]
    Review --> Decision["Organizer Makes Final Assignment Decision"]
```

> [!NOTE]
> The AI matching engine **assists the Organizer** by calculating skill overlap, keyword alignment, and experience suitability. The **final assignment decision remains entirely in the hands of the Organizer**.

---

## 9. Attendee AI Concierge & Mascot Studio

### Attendee-Only AI Assistant
* Exclusively accessible to authenticated attendees (`role: "attendee"`).
* Grounded in authentic database records to answer questions regarding:
  * *"What is this event about?"* $\rightarrow$ Authentic title, description, and agenda.
  * *"How much does it cost?"* $\rightarrow$ Accurate ticket pricing and payment options.
  * *"Where is it located?"* $\rightarrow$ Exact campus venue and gate arrival guidance.
  * *"When does it start?"* $\rightarrow$ Formatted dates and start/end schedules.
  * *"How do I register?"* $\rightarrow$ Step-by-step guidance with direct registration actions.
  * *"Is registration still open?"* $\rightarrow$ Live seat availability against venue capacity.

### AI Event Mascot Studio
* Organizers can generate a visual mascot tailored to event titles, categories, and keywords.
* Mascots are stored as SVG asset references (`mascotUrl` and `mascotPrompt`) in the event record.
* Generated mascots seamlessly appear on event detail pages and become the active persona of the AI chatbot.
* **Non-Blocking Resilience**: Mascot generation is completely optional and does not impede standard event creation.

### Predefined Thematic Systems
Controlled, safe styling metadata mapped to event categories:

| Theme | Mascot Character | Thematic Palette | Assistant Persona |
| :--- | :--- | :--- | :--- |
| **`TECH`** | 🦉 Byte the Cyber Owl | Neon Cyan & Indigo | AI & Hackathon Concierge |
| **`CULTURAL`** | 🦊 Aria the Melody Fox | Rose, Pink & Fuchsia | Arts & Performance Concierge |
| **`SPORTS`** | 🐆 Bolt the Lightning Panther | Emerald, Gold & Amber | Athletics & Tournament Concierge |
| **`ACADEMIC`** | 🦦 Atom the Discovery Otter | Emerald, Teal & Slate | Science & Research Concierge |
| **`BUSINESS`** | 🦅 Apex the Visionary Falcon | Sky Blue & Charcoal | Leadership & Summit Concierge |
| **`ENTERTAINMENT`**| 🦊 Aria the Melody Fox | Violet, Purple & Rose | Campus Festival Concierge |
| **`GENERAL`** | ✨ Nova the Campus Spark | Crimson Wine & Gold | Official EventHub Concierge |

---

## 10. Four-Device Presentation Architecture

EventHub is optimized for live final-round presentations utilizing four separate devices simultaneously:

```
┌───────────────────────────┐      ┌───────────────────────────┐
│     DEVICE 1: ADMIN       │      │   DEVICE 2: ORGANIZER     │
│   (Tanishka Ghewari)      │      │       (Payal Mane)        │
│  • Reviews & Approves     │      │  • Drafts & Publishes     │
│  • Global Platform Audit  │      │  • AI Volunteer Matching  │
└─────────────┬─────────────┘      └─────────────┬─────────────┘
              │                                  │
              └───────────────┐  ┌───────────────┘
                              ▼  ▼
                    ┌──────────────────────┐
                    │  EVENTHUB PRODUCTION │
                    │     SHARED CLOUD     │
                    └─────────┬──┬─────────┘
                              ▲  ▲
              ┌───────────────┘  └───────────────┐
              │                                  │
┌─────────────┴─────────────┐      ┌─────────────┴─────────────┐
│    DEVICE 3: ATTENDEE     │      │   DEVICE 4: VOLUNTEER     │
│      (Mahi Kasliwal)      │      │      (Nehal Ahuja)        │
│  • AI Thematic Concierge  │      │  • Receives Assignment    │
│  • Registers & Pays (QR)  │      │  • Camera QR Gate Scan    │
└───────────────────────────┘      └───────────────────────────┘
```

All four devices connect to the same cloud deployment, demonstrating live end-to-end event operations across all roles.

---

## 11. Technology Stack

### Frontend
* **Core Library**: React v18.3.1
* **Language**: TypeScript v5.7.2
* **Build Tool & Bundler**: Vite v7.3.6
* **Routing**: Wouter v3.7.1
* **State & Data Fetching**: TanStack React Query v5.69.0
* **Styling**: Vanilla TailwindCSS v4.0.0
* **UI Primitives**: Radix UI (Dialog, Dropdown, Tabs, Toast, Slot, Progress)
* **Icons**: Lucide React v1.16.0
* **Charts & Analytics**: Recharts v2.15.4
* **Motion & Animations**: Framer Motion v12.42.0

### Backend & API
* **Runtime**: Node.js (ES Modules)
* **Web Framework**: Express v5.0.0
* **Realtime Engine**: Socket.IO v4.8.1
* **Security & Rate Limiting**: `express-rate-limit`, `cors`, `cookie-parser`
* **Validation**: Zod v3.24.2 / `@workspace/api-zod`
* **Logging**: Pino & Pino-Http v10.4.0

### Database & ORM
* **Database**: PostgreSQL (Neon Cloud Serverless Postgres / `serverless-pg`)
* **ORM**: Drizzle ORM v0.40.0
* **Database Migrations**: Drizzle Kit v0.30.5

### Payments & QR
* **Payment Gateway**: Razorpay SDK v2.9.5 (HMAC-SHA256 Cryptographic Verification)
* **QR Generation**: QRCode v1.5.4
* **QR Camera Scanner**: HTML5-QRCode v2.3.8

---

## 12. System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client (React 18 + Vite)"]
        UI["TailwindCSS Responsive UI"]
        WouterRouter["Wouter Client Router"]
        ReactQuery["TanStack React Query Cache"]
        SocketClient["Socket.IO Realtime Client"]
    end

    subgraph APILayer["Backend Serverless / Express API"]
        AuthMiddleware["JWT & Session Auth Guards"]
        RBAC["Role-Based Access Control"]
        RestRouter["REST API Endpoints"]
        SocketServer["Socket.IO Event Broadcaster"]
    end

    subgraph ServiceLayer["Specialized Engines"]
        AIService["AI Chatbot & Mascot Synthesis"]
        VLMService["AI Volunteer Matcher"]
        PaymentService["Razorpay Payment Verification"]
        QRService["Cryptographic QR Ticket Engine"]
    end

    subgraph StorageLayer["Data & Persistence"]
        PostgresDB[("PostgreSQL Database (Drizzle ORM)")]
        InMemoryStore[("Resilient Memory Cache")]
    end

    UI --> WouterRouter --> ReactQuery
    ReactQuery <-->|"HTTP / REST"| RestRouter
    SocketClient <-->|"WebSockets"| SocketServer

    RestRouter --> AuthMiddleware --> RBAC
    RBAC --> ServiceLayer
    ServiceLayer --> StorageLayer
```

---

## 13. API Route Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register new attendee or volunteer account |
| `POST` | `/api/auth/login` | Public | Authenticate with email & password |
| `POST` | `/api/auth/demo-login` | Public | Authenticate 4 permanent demo accounts |
| `POST` | `/api/auth/logout` | Authenticated | Terminate session and clear cookies |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |

### 📅 Events (`/api/events`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | List published events with category/search filters |
| `GET` | `/api/events/:id` | Public | Get complete event details |
| `POST` | `/api/events` | Organizer, Admin | Create event draft |
| `PUT` | `/api/events/:id` | Organizer, Admin | Update existing event |
| `POST` | `/api/events/:id/submit-approval` | Organizer | Submit event for admin review |
| `POST` | `/api/events/:id/approve` | Admin | Approve pending event |
| `POST` | `/api/events/:id/reject` | Admin | Reject event with reason |
| `POST` | `/api/events/:id/publish` | Organizer | Publish approved event |
| `POST` | `/api/events/mascot/generate` | Organizer, Admin | Synthesize new AI event mascot |

### 🎟️ Registrations & QR (`/api/registrations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/registrations/my` | Attendee | List current attendee's confirmed tickets |
| `POST` | `/api/registrations` | Attendee | Register for free event |
| `GET` | `/api/events/:id/registrations` | Organizer, Admin | View event attendee roster |

### 💳 Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create-order` | Attendee | Create Razorpay payment order |
| `POST` | `/api/payments/verify` | Attendee | Cryptographically verify HMAC-SHA256 signature and issue QR pass |
| `GET` | `/api/payments/ledger` | Admin | Retrieve university payment ledger |

### 🤝 Volunteers (`/api/volunteers`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/volunteers/requirements` | Public | Browse event volunteer requirements |
| `POST` | `/api/volunteers/requirements` | Organizer | Post new volunteer requirement |
| `POST` | `/api/volunteers/apply` | Volunteer | Submit application with skills/resume |
| `GET` | `/api/volunteers/my-applications` | Volunteer | View application & assignment status |
| `POST` | `/api/events/:id/volunteers/ai-match` | Organizer | Compute AI skill match scores |
| `POST` | `/api/events/:id/volunteers/assign` | Organizer | Assign volunteer to duty role |

### 🤖 AI Chatbot & Group Chat (`/api/chat`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat/attendee` | Attendee | Event-grounded AI concierge chat |
| `GET` | `/api/chat/messages` | Authenticated | Fetch team group chat history |
| `POST` | `/api/chat/messages` | Authenticated | Send message to real-time group chat |

### 📷 Attendance & Check-In (`/api/checkin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/checkin/validate-qr` | Volunteer, Organizer | Validate QR token at entrance |
| `POST` | `/api/checkin/process` | Volunteer, Organizer | Check in attendee with duplicate guard |
| `POST` | `/api/checkin/checkout` | Volunteer, Organizer | Log attendee check-out |

---

## 14. Database Schema Entities

```mermaid
erDiagram
    USERS ||--o{ EVENTS : organizes
    USERS ||--o{ REGISTRATIONS : registers
    USERS ||--o{ VOLUNTEER_APPLICATIONS : submits
    USERS ||--o{ PAYMENTS : pays
    USERS ||--o{ CHAT_MESSAGES : sends
    USERS ||--o{ NOTIFICATIONS : receives
    
    EVENTS ||--o{ REGISTRATIONS : contains
    EVENTS ||--o{ VOLUNTEER_REQUIREMENTS : defines
    EVENTS ||--o{ VOLUNTEER_APPLICATIONS : receives
    EVENTS ||--o{ PAYMENTS : generates

    USERS {
        int id PK
        string name
        string email
        string passwordHash
        string role
        string phone
        string collegeId
    }

    EVENTS {
        int id PK
        int organizerId FK
        string title
        string category
        string venue
        timestamp startTime
        timestamp endTime
        int capacity
        int price
        string status
        string mascotUrl
        string mascotPrompt
    }

    REGISTRATIONS {
        int id PK
        int eventId FK
        int userId FK
        string qrToken
        string status
        string paymentStatus
        int amountPaid
        timestamp checkedInAt
    }

    PAYMENTS {
        int id PK
        int eventId FK
        int userId FK
        string orderId
        string paymentId
        string signature
        int amount
        string status
    }

    VOLUNTEER_APPLICATIONS {
        int id PK
        int eventId FK
        int userId FK
        string skills
        string experience
        string status
        string assignedRole
        int matchScore
    }
```

---

## 15. Security & Governance

* **Role-Based Access Control (RBAC)**: Strict backend authorization enforcement (`admin`, `organizer`, `attendee`, `volunteer`).
* **Salted Password Hashing**: Passwords hashed using bcrypt.
* **Server-Side Payment Verification**: Razorpay signatures verified against cryptographic HMAC-SHA256 secrets.
* **Fraud-Proof QR Passes**: Digitally generated QR tokens containing unique verifiable registration identifiers.
* **Duplicate Gate Entry Protection**: Real-time validation preventing passes from being checked in multiple times.
* **Capacity Overrun Protection**: Strict database-level transaction limits preventing ticket overselling.

---

## 16. Local Development Setup

### Prerequisites
* **Node.js**: v20.x or higher
* **pnpm**: v9.x or higher

### Installation & Run Commands

```bash
# 1. Clone the repository
git clone https://github.com/payalmane21/TechRush.git
cd TechRush

# 2. Install workspace dependencies
pnpm install

# 3. Start local development server (Frontend + API)
pnpm run dev

# 4. Build production bundle
pnpm run build

# 5. Run automated test suites
node scratch/test_ai_event_mascot.mjs
node scratch/test_ai_chatbot_mascot_theming.mjs
node scratch/test_realtime_group_chat.mjs
```

### Environment Variables
Configure the following keys in your environment (`.env`):
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
RAZORPAY_KEY_ID=rzp_test_key
RAZORPAY_KEY_SECRET=your_secret_key
SESSION_SECRET=your_session_secret
```

---

## 17. Live Demonstration Flow

```
1. ADMIN (Device 1)
   └── Reviews and approves pending event proposals with 1 click.

2. ORGANIZER (Device 2)
   ├── Uses AI Event Mascot Studio to generate a thematic character.
   ├── Publishes the approved event live.
   └── Monitors real-time capacity and revenue feeds.

3. ATTENDEE (Device 3)
   ├── Interacts with the event-themed AI Concierge Chatbot.
   ├── Registers and completes verified Razorpay payment.
   └── Receives instant cryptographic QR pass.

4. VOLUNTEER (Device 4)
   ├── Receives AI-matched duty assignment from organizer.
   └── Scans attendee QR passes at gate entrance using live camera.

5. ALL FOUR ROLES (Devices 1-4)
   └── Coordinate in real time using the unified EventHub Live Team Chat!
```

---

## 18. Project Goal

**EventHub** aims to provide a unified, intelligent, and real-time platform for managing the complete event lifecycle while reducing administrative overhead, preventing fraud, and delivering seamless experiences for organizers, attendees, volunteers, and campus administrators alike.