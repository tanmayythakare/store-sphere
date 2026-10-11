<div align="center">

# StoreSphere — Commercial Store Directory & Rating Intelligence Engine

**Modern Enterprise Full-Stack Portal with Express, PostgreSQL 16, Prisma 6.4, React 18, and Atomic Rating Engine**

<p align="center">
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.4"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18.3"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 20"></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express&logoColor=white" alt="Express 4.19"></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql" alt="PostgreSQL 16"></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-6.4.1-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma 6.4.1"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://jestjs.io/"><img src="https://img.shields.io/badge/Jest-29.7-C21325?style=flat-square&logo=jest&logoColor=white" alt="Jest 29.7"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="MIT License"></a>
  <a href="#single-command-production-deployment-via-docker"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker Ready"></a>
</p>

<p align="center">
  Multi-tenant commercial directory, role-based governance, and community ratings with zero duplicate mutations.<br>
  Express TypeScript · React 18 SPA · PostgreSQL 16 · Prisma ORM · Atomic Upsert · Docker Compose.
</p>

<p align="center">
  <a href="#quick-flow">Quick Flow</a> •
  <a href="#system-architecture">Architecture</a> •
  <a href="#core-capabilities">Core Capabilities</a> •
  <a href="#role-access-matrix">Role Matrix</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#pre-configured-demo-credentials">Demo Credentials</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#automated-test-suite">Test Suite</a> •
  <a href="#api-reference">API Reference</a>
</p>

</div>

---

## Quick Flow

```
Register / Sign In  →  Role-Based Routing  →  Store Catalog & Search  →  Atomic 1–5 Star Rating Upsert  →  Owner Review Feed / Admin Analytics
```

---

## Executive Overview

StoreSphere is an enterprise-grade commercial directory and community rating portal engineered for structured multi-tenant administration, store inventory tracking, and consumer review aggregation. Built on a resilient TypeScript stack powered by Express, PostgreSQL, Prisma ORM, and React 18, StoreSphere enforces strict enterprise domain validations, robust role-based access control (RBAC), atomic database operations, and sub-millisecond query performance.

---

## System Architecture

```mermaid
flowchart TD
    subgraph PresentationTier ["Client Presentation Tier (React 18 SPA + Vite :5173)"]
        UI["Tailwind CSS 3.4 Design System<br/>Modern Minimalist Commercial Theme"]
        Router["React Router 6 Shell<br/>Role-Guarded Protected Routes"]
        AuthCtx["Auth Context & Token Storage<br/>JWT Persistence & Dynamic Home Route"]
        Dropdown["Custom Headless Floating Dropdown<br/>Accessible Outside Click Listener"]
        APIClient["Axios Interceptor Instance<br/>Automated Bearer Header & RFC Error Parsing"]

        UI --> Router
        Router --> AuthCtx
        AuthCtx --> Dropdown
        AuthCtx --> APIClient
    end

    subgraph GatewayTier ["Backend API & Middleware Gateway (Express + TypeScript :5000)"]
        CORS["CORS & JSON Body Parser"]
        AuthMW["Stateless JWT Verification Middleware<br/>Bearer Token Parser & Claim Extraction"]
        RBAC["Role-Based Access Control Guards<br/>ADMIN | STORE_OWNER | NORMAL_USER"]
        Validator["Strict Domain Validation Middleware<br/>Name 20-60, Lowercase Email, Password Policy"]

        APIClient -->|"REST API / Bearer Token"| CORS
        CORS --> AuthMW
        AuthMW --> RBAC
        RBAC --> Validator
    end

    subgraph ServiceTier ["Core Domain Controllers"]
        AuthCtrl["Authentication Controller<br/>BCrypt Hashing, Password Rotation & Profile Me"]
        StoreCtrl["Store Catalog & Rating Controller<br/>Case-Insensitive Search, Aggregations & Review Feed"]
        AdminCtrl["Admin Management Controller<br/>Parallel Metrics Aggregation & Account Provisioning"]

        Validator --> AuthCtrl
        Validator --> StoreCtrl
        Validator --> AdminCtrl
    end

    subgraph PersistenceTier ["Persistence & Data Tier (PostgreSQL 16 Engine :5432)"]
        Prisma["Prisma ORM 6.4.1 Client<br/>Query Builder, Seed Scripts & Migrations"]
        DB[("PostgreSQL 16 Relational Engine<br/>storedb / Public Schema")]
        CompositeIdx["Composite Key Unique Constraint<br/>UNIQUE (userId, storeId) for Atomic Upsert"]

        AuthCtrl --> Prisma
        StoreCtrl --> Prisma
        AdminCtrl --> Prisma
        Prisma --> DB
        DB --> CompositeIdx
    end
```

---

## Core Capabilities

### 01. Three-Tier Role-Based Access Control (RBAC)
* **Decoupled Security Matrix**: Segregates platform capabilities into three strictly defined user roles: `ADMIN`, `STORE_OWNER`, and `NORMAL_USER`.
* **Zero Trust Backend Enforcement**: Dedicated middleware inspects incoming JWT claims on every protected endpoint, preventing unauthorized role spoofing or privilege escalation.
* **Intelligent Client Redirection**: Dynamic role-aware routing automatically navigates administrators to `/admin`, store owners to `/owner`, and regular shoppers to `/stores` upon authentication.

### 02. Strict Domain Validation & Password Cryptography
* **Human-Centric Name Bounds**: Enforces full names strictly between 20 and 60 characters with live character counter feedback during registration.
* **Normalized Email Architecture**: Automatically normalizes all incoming email strings to lowercase prior to indexing and lookup, eliminating case-variant duplicate accounts.
* **Hardened Password Policy**: Demands 8 to 16 characters containing at least one uppercase letter and one special character, protected at rest via salted bcrypt hashing (10 computational rounds).
* **Defensive Error Responses**: Sanitized error payloads prevent sensitive database schema leaks or stack traces from reaching client callers.

### 03. Atomic Rating Upsert Engine & Composite Key Constraint
* **Zero Duplicate Mutations**: Relational schema enforces a strict composite unique constraint on `(userId, storeId)`, allowing users to re-rate stores or adjust their feedback indefinitely without creating orphaned records.
* **Strict Rating Bounds**: Guarantees rating scores remain strictly between 1 and 5 stars, with an optional 100-character textual feedback comment.
* **Sub-Millisecond Recomputation**: Store average ratings and submission volume counters are calculated on-the-fly during read operations, ensuring reviews reflect instantaneously.

### 04. Real-Time Store Analytics & Parallel Query Aggregation
* **Non-Blocking Telemetry**: System metrics (`totalUsers`, `totalStores`, `totalRatings`) execute concurrently via `Promise.all` database queries, minimizing endpoint response latency.
* **Store Owner Intelligence**: Store owners enjoy dedicated portal access to monitor overall store average score and customer review feeds with author names and timestamps.
* **Case-Insensitive Catalog Search**: Live store search allows shoppers to filter stores by name or address with multi-column sorting (name, email, address, rating score).

---

## Role Access Matrix

| Platform Capability | System Administrator | Store Owner | Normal User | Unauthenticated |
| :--- | :---: | :---: | :---: | :---: |
| **System Metrics Dashboard** | Yes | No | No | No |
| **User Directory & Provisioning** | Yes | No | No | No |
| **Store Registry & Assignment** | Yes | No | No | No |
| **Store Performance & Review Feed** | No | Yes (Assigned Store) | No | No |
| **Explore Store Catalog** | Yes | Yes | Yes | No |
| **Case-Insensitive Search & Sort** | Yes | Yes | Yes | No |
| **Submit / Modify 1–5 Star Rating** | No | No | Yes | No |
| **Change Account Password** | Yes | Yes | Yes | No |
| **Self-Service Registration** | Console | Console | Yes | Yes |

---

## Strict Domain Validation Guardrails

| Parameter | Validation Constraint | System Behavior |
| :--- | :--- | :--- |
| **User Full Name** | 20 to 60 characters | Live length feedback on registration; rejected with HTTP 400 if outside boundaries |
| **User Email** | RFC-compliant email string | Automatically converted to lowercase before hashing or query; unique constraint enforced |
| **Password** | 8 to 16 characters | Must contain >= 1 uppercase letter and >= 1 special character; salted & hashed via bcrypt |
| **User Address** | Maximum 400 characters | Enforced across registration and admin account provisioning |
| **Rating Score** | Integer between 1 and 5 | Value clamped between 1 and 5 stars; rejected if outside bounds |
| **Rating Comment** | Maximum 100 characters | Optional feedback field; truncated and rejected if exceeding limit |
| **Rating Storage** | Composite key `(userId, storeId)` | Atomic upsert updates existing scores without duplicates |

---

## Tech Stack

### Frontend & UI Engine
| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | React | 18.3.1 | Component-driven declarative Single-Page Application |
| **Tooling** | Vite | 6.4.4 | Sub-second Hot Module Replacement (HMR) and optimized rollup bundler |
| **Routing** | React Router DOM | 6.22.0 | Declarative client routing and role-guarded route boundaries |
| **Styling** | Tailwind CSS | 4.0 / 3.4 | Utility-first CSS engine with custom enterprise brand design tokens |
| **Icons** | Lucide React | 0.359.0 | Zero-emoji vector SVG iconography |
| **HTTP Client** | Axios | 1.6.7 | Request and response interceptors for JWT bearer token transmission |
| **Language** | TypeScript | 5.4.0 | Strongly-typed interfaces for state, props, and API payloads |

### Backend & Infrastructure
| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | 20.x LTS | Server runtime environment |
| **Framework** | Express.js | 4.19.2 | Minimal, flexible RESTful API framework |
| **Language** | TypeScript | 5.4.0 | Statically typed backend code transpiled to idiomatic CommonJS |
| **ORM** | Prisma | 6.4.1 | Next-generation Node.js and TypeScript ORM with type-safe schema |
| **Database** | PostgreSQL | 16.0 | ACID-compliant relational database engine |
| **Authentication** | JSON Web Tokens | 9.0.2 | Stateless claims-based cryptographic access tokens |
| **Cryptography** | bcryptjs | 2.4.3 | Salted credential hashing (10 rounds) |
| **Test Engine** | Jest & Supertest | 29.7.0 / 6.3.4 | Comprehensive end-to-end integration and API testing suite |
| **Containers** | Docker Compose | 2.x | Multi-container production deployment orchestration |

---

## Pre-Configured Demo Credentials

The platform includes a pre-seeded database with realistic accounts across all three user tiers:

| Role | Email Address | Password | Assigned Scope |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | `admin@storesphere.com` | `Admin@1234` | Full access to metrics, user management, and store provisioning |
| **Store Owner (Store 1)** | `owner1@store.com` | `Owner@1234` | Owner of *Nexus Supermarket Baner*; review feed and average metrics |
| **Store Owner (Store 2)** | `owner2@store.com` | `Owner@1234` | Owner of *Aura Organic Essentials*; review feed and average metrics |
| **Normal User 1** | `user@example.com` | `User@1234` | Can search catalog, submit ratings, and modify feedback |
| **Normal User 2** | `priyanka@example.com` | `User@1234` | Can search catalog, submit ratings, and modify feedback |
| **Normal User 3** | `abhishek@example.com` | `User@1234` | Can search catalog, submit ratings, and modify feedback |

---

## Getting Started

### Prerequisites

* **Node.js**: v20.x or higher
* **npm**: v10.x or higher
* **PostgreSQL**: v16.x or Docker daemon installed and running

---

### Local Development Setup

#### 1. Clone Repository & Setup Environment Variables

```bash
git clone https://github.com/tanmayythakare/store-sphere.git
cd store-sphere
```

Configure backend environment variables in `server/.env`:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storedb?schema=public"
JWT_SECRET="super-secret-jwt-key-storesphere-2026"
```

Configure client environment variables in `client/.env` (optional, defaults to port 5000):

```env
VITE_API_URL="http://localhost:5000/api"
```

#### 2. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

#### 3. Database Migration & Seeding

Ensure your local PostgreSQL instance is running, then run migrations and the seed script:

```bash
cd ../server
npm run db:migrate
npm run db:seed
```

#### 4. Launch Development Services

Terminal 1 (Backend API):
```bash
cd server
npm run dev
# Server listening on http://localhost:5000
```

Terminal 2 (Frontend Client):
```bash
cd client
npm run dev
# Client available on http://localhost:5173
```

---

## Single-Command Production Deployment via Docker

StoreSphere includes a production-ready, multi-stage Docker environment and Compose manifest.

```bash
# From the project root directory:
docker compose up --build -d
```

This single command:
1. Boots a containerized PostgreSQL 16 database with dedicated persistent volumes and health checks.
2. Compiles client static assets via Vite.
3. Builds the TypeScript backend.
4. Serves the unified production service on port 80.

Access the application at `http://localhost`.

---

## Automated Test Suite

StoreSphere includes an extensive integration test suite engineered with Jest and Supertest, validating core domain rules, security guards, and rating mutations against a live test database.

```bash
cd server
npm test
```

### Test Suite Coverage Breakdown (25 Tests / 100% Pass Rate)

| Test Suite | File | Test Cases | Areas Tested |
| :--- | :--- | :---: | :--- |
| **Authentication & Validation** | `tests/auth.test.ts` | 11 | 20–60 char names, lowercase email enforcement, password complexity, duplicate emails, login token emission, `/me` profile |
| **Role-Based Access Control** | `tests/rbac.test.ts` | 7 | Guarding admin metrics and store creation from non-admins; guarding owner views; preventing admins and owners from rating stores |
| **Store Rating & Upsertion** | `tests/rating.test.ts` | 7 | 1–5 star bounds, comment character ceilings, atomic upsert update logic, case-insensitive search queries, personal rating attachment |

---

## REST API Reference

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new normal user account (enforces 20–60 char name, lowercase email, password policy) |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and receive JSON Web Token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile and role details |
| `PUT` | `/api/auth/password` | Authenticated | Change user account password with security verification |

### Store Catalog Endpoints (`/api/stores`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/stores` | Authenticated | Retrieve store directory with search (`?search=`), sort (`?sortBy=&order=`), and user rating details |
| `GET` | `/api/stores/:id` | Authenticated | Fetch specific store profile by ID |
| `POST` | `/api/stores/:id/ratings` | Normal User | Submit or update 1–5 star rating with optional 100-character feedback comment |
| `GET` | `/api/stores/owner/my-store` | Store Owner | Fetch store performance summary and customer review list for authenticated owner |

### Administration Endpoints (`/api/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/metrics` | Administrator | Retrieve system-wide metrics (total users, total stores, total ratings submitted) |
| `GET` | `/api/admin/stores` | Administrator | Query all stores with owner details, rating averages, search, and sorting |
| `POST` | `/api/admin/stores` | Administrator | Provision a new store and optionally assign an existing store owner |
| `GET` | `/api/admin/users` | Administrator | Query user directory with role filters (`?role=`), search, and sorting |
| `POST` | `/api/admin/users` | Administrator | Provision an administrator, store owner, or normal user directly |

---

## Directory Structure

```
├── .github/
│   └── workflows/
│       └── ci.yml             # Automated CI pipeline for tests & frontend compilation
├── client/                    # Frontend React 18 Application
│   ├── src/
│   │   ├── components/        # UI components (BrandLogo, CustomDropdown, StarRating, Modal, etc.)
│   │   ├── context/           # AuthContext for session management & token persistence
│   │   ├── pages/             # Route pages (AdminDashboard, OwnerDashboard, UserDashboard, Login, Register, Settings)
│   │   ├── services/          # Axios HTTP instance with JWT interceptors
│   │   └── types/             # TypeScript domain interface definitions
│   ├── package.json
│   ├── tailwind.config.js     # Brand design system tokens
│   └── vite.config.ts
├── server/                    # Backend Express + TypeScript Service
│   ├── prisma/
│   │   ├── schema.prisma      # PostgreSQL models (User, Store, Rating, Role enum)
│   │   └── seed.ts            # Production-like database seeding script
│   ├── src/
│   │   ├── controllers/       # Business logic (authController, storeController, adminController)
│   │   ├── middleware/        # Security guards (auth middleware, request validation middleware)
│   │   ├── routes/            # Route declarations (authRoutes, storeRoutes, adminRoutes)
│   │   ├── prisma.ts          # Central Prisma Client instance
│   │   └── server.ts          # Express application initialization & static SPA serving
│   ├── tests/                 # Supertest automated integration test suites
│   └── package.json
├── docker-compose.yml         # Containerized production orchestration
├── Dockerfile                 # Multi-stage production container build
└── README.md                  # Comprehensive system documentation
```

---

## Continuous Integration

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every pull request and push to `main`:
1. Spawns an isolated PostgreSQL 16 container service.
2. Applies Prisma database schema migrations (`prisma migrate deploy`).
3. Executes the complete 25-case Supertest integration suite.
4. Verifies static TypeScript types and builds the production React application bundle.

---

## License

This project is licensed under the [MIT License](LICENSE).
