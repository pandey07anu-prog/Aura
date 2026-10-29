# Aura Finance — Premium Personal Finance Manager & Expense Tracker

> **A high-end, production-ready fintech personal finance platform** engineered with an ultra-sleek monochrome Apple/Fintech SaaS aesthetic, Java 17 Spring Boot REST backend, Spring Security 6 stateless JWT authentication, MongoDB document persistence with exact `Decimal128` monetary precision, and React 18 + Vite frontend.

---

## 📸 Key Highlights & Aesthetics

- **Curated Black-and-White Design System**: Built strictly adhering to the luxury monochrome palette:
  - Deep Base: `#080808`
  - Secondary Elevated: `#111111`
  - Card Surfaces: `#171717`
  - Subtle Borders: `#292929`
  - Typography: Pure White `#FFFFFF` & Slate Gray `#A3A3A3`
  - Intentional Accents: Subtle muted green (`#22c55e`) for income/savings and subtle red (`#ef4444`) for debit/spending only where it enhances financial readability.
- **Cinematic Geometric Preloader**: Custom minimal geometric preloader with smooth entrance/exit transitions and reduced-motion support.
- **True Monetary Accuracy**: Uses Java `BigDecimal` mapped to MongoDB `Decimal128` converters across all ledgers—never using floating-point math for balance calculations.
- **Robust Category Lifecycle**: Safe deletion prevention. If a category is linked to existing transactions, the backend blocks orphan records and offers transactional reassignment or instant archiving.
- **Recurring Transactions Engine**: Spring `@Scheduled` background worker handles recurring income/expense rules (Weekly, Monthly, Yearly) with duplicate run prevention and audit tracking.
- **Dedicated Admin Control Center**: Accessible exclusively to `ROLE_ADMIN` users with platform-wide aggregate metrics, user status controls (Activate/Suspend), and audit activity logs.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS (Custom fintech configuration) + Vanilla CSS utilities
- **Icons:** Lucide React
- **Charts:** Recharts (responsive financial charts, area charts, donut distributions)
- **Routing:** React Router v6 (protected user & admin route wrappers)
- **HTTP Client:** Axios (automatic Bearer token injection & 401 session expiration interceptor)
- **Animations:** Framer Motion + CSS keyframes

### Backend
- **Framework:** Java 17 + Spring Boot 3.3.5
- **Security:** Spring Security 6 with stateless JWT Bearer token authentication & BCrypt password hashing
- **Database Access:** Spring Data MongoDB (Repositories, Criteria Queries, Aggregations)
- **Monetary Precision:** Custom `BigDecimal` <-> `org.bson.types.Decimal128` BSON Converters
- **Scheduler:** Spring `@EnableScheduling` with automated cron runner for recurring rules
- **Mailing:** Spring Mail with HTML templating support and dev mock-fallback
- **Reporting:** Apache Commons CSV generator for financial export
- **Build Tool:** Maven 3 (Wrapper included: `mvnw` / `mvnw.cmd`)

### Database
- **Database Engine:** MongoDB Community Server (v7+ / v9+) or MongoDB Atlas Cloud Cluster
- **Database Name:** `expensetracker`
- **Supported GUIs:** MongoDB Compass, mongosh

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Java 17+ JDK** (e.g. OpenJDK 17 or JetBrains Runtime 17)
2. **Node.js 18+ & npm**
3. **MongoDB** (Local Windows/Linux service on port `27017` OR a MongoDB Atlas connection URI)

---

### Step 1: Clone & Configure Database

Verify that your local MongoDB service is running on `mongodb://localhost:27017`:
```powershell
# On Windows, verify MongoDB service:
Get-Service MongoDB
```

If using **MongoDB Atlas**, obtain your connection string from the Atlas dashboard:
`mongodb+srv://<username>:<password>@cluster.mongodb.net/expensetracker?retryWrites=true&w=majority`

---

### Step 2: Configure Environment Variables

#### Backend Configuration:
Inspect `backend/.env.example` or set environment variables:
```bash
# Location: backend/.env.example
MONGODB_URI=mongodb://localhost:27017/expensetracker
MONGODB_DATABASE=expensetracker
JWT_SECRET=9a4f2c8d3b7a1e6f5c8b2d4e7a9c1f3b5e7d9a1c3e5b7d9a1c3e5b7d9a1c3e5b
JWT_EXPIRATION_MS=86400000
MAIL_ENABLED=false
APP_BASE_URL=http://localhost:5173
ADMIN_DEFAULT_EMAIL=admin@aurafinance.com
ADMIN_DEFAULT_PASSWORD=Admin@123456
```

#### Frontend Configuration:
Inspect `frontend/.env.example` or create `frontend/.env`:
```bash
# Location: frontend/.env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

### Step 3: Start the Backend Server

Open a terminal in `backend/`:
```powershell
cd backend

# If JAVA_HOME is not set to Java 17 in your global PATH:
$env:JAVA_HOME = "C:\Users\adity\.jdks\jbr-17.0.14"

# Run Spring Boot:
.\mvnw.cmd spring-boot:run
```
The backend initializes database collections, registers custom Decimal128 converters, provisions default system categories, and seeds the root administrator if not present.
Backend API runs on: **`http://localhost:8080/api`**

---

### Step 4: Start the Frontend Application

Open a second terminal in `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
The frontend launches at: **`http://localhost:5173`**

---

## 🔑 Provisioned Administrator Credentials

The system initializes with 16 core system categories and the root administrator:

| Account Role | Email Address | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@aurafinance.com` | `Admin@123456` | Platform Overview, All Users, User Detail Drills, System Categories, Audit Logs |

> **Real Data Guarantee**: There are **zero mock or fake user accounts or transactions** hardcoded into the platform or database. New users create their authentic accounts via the Registration page, and all metrics in the user dashboard and admin portal derive strictly from live MongoDB documents.

---

## 🌐 Connecting to MongoDB Atlas (Cloud Database)

To connect Aura Finance to MongoDB Atlas cloud cluster:

1. **Create an Atlas Account & Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free Shared Cluster (M0).
2. **Configure Database Access (Credentials)**:
   - Navigate to **Security** $\rightarrow$ **Database Access** $\rightarrow$ **Add New Database User**.
   - Create a user (e.g. `aurafinance_user`) with password authentication and `Read and write to any database` privileges.
3. **Configure Network Access (Whitelist IP)**:
   - Navigate to **Security** $\rightarrow$ **Network Access** $\rightarrow$ **Add IP Address**.
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so cloud servers (Render, Railway, etc.) and your machine can connect.
4. **Get your Connection String**:
   - Go to **Deployments** $\rightarrow$ **Database** $\rightarrow$ Click **Connect**.
   - Select **Drivers** (Java 4.3 or later).
   - Copy the SRV connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/expensetracker?retryWrites=true&w=majority
     ```
5. **Set in Backend Environment**:
   - In `backend/.env` or your hosting provider's Environment Variables dashboard:
     ```bash
     MONGODB_URI=mongodb+srv://aurafinance_user:YOUR_ACTUAL_PASSWORD@cluster0.abcde.mongodb.net/expensetracker?retryWrites=true&w=majority
     MONGODB_DATABASE=expensetracker
     ```
   - Restart the backend. Spring Boot will automatically connect to Atlas, create the `expensetracker` collections, and seed the default system categories and your admin account!

---

## 🚢 Full Production Deployment Guide

### Option 1: Cloud Web Services (Render + Vercel) — Recommended & Free Tier Friendly

#### Step A: Deploy Backend on Render (or Railway)
1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com) and click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository.
4. Render will auto-detect the root `render.yaml` or you can manually configure:
   - **Environment:** Docker
   - **Root Directory:** `backend`
   - **Docker Context:** `backend`
   - **Dockerfile Path:** `backend/Dockerfile`
5. Under **Environment Variables**, add:
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/expensetracker?retryWrites=true&w=majority`
   - `MONGODB_DATABASE`: `expensetracker`
   - `JWT_SECRET`: (Generate a random 64-char hex string)
   - `APP_BASE_URL`: (Your frontend URL, e.g. `https://aura-finance.vercel.app`)
   - `CORS_ALLOWED_ORIGINS`: `https://aura-finance.vercel.app`
   - `ADMIN_DEFAULT_EMAIL`: `admin@aurafinance.com`
   - `ADMIN_DEFAULT_PASSWORD`: `YourSecurePassword123!`
6. Click **Create Web Service**. Once deployed, Render provides your backend URL: e.g. `https://aura-backend.onrender.com`.

#### Step B: Deploy Frontend on Vercel (or Netlify)
1. Sign in to [Vercel](https://vercel.com) and click **Add New...** $\rightarrow$ **Project**.
2. Select your repository.
3. Set **Root Directory** to `frontend`.
4. Framework Preset: **Vite**.
5. Under **Environment Variables**, set:
   - `VITE_API_BASE_URL`: `https://aura-backend.onrender.com/api`
6. Click **Deploy**. Vercel will build the frontend and serve it at your custom `*.vercel.app` domain with SPA routing support via the included `vercel.json`.

---

### Option 2: Docker & Docker-Compose (Any VPS / Linux Server / AWS EC2)

To deploy the entire stack using Docker:
```bash
# 1. Clone repository to your server:
git clone <your-repo-url>
cd <repo-folder>

# 2. Set your MongoDB Atlas URI in docker-compose.yml or export it:
export MONGODB_URI="mongodb+srv://<user>:<pwd>@cluster.mongodb.net/expensetracker?retryWrites=true&w=majority"
export APP_BASE_URL="https://yourdomain.com"
export VITE_API_BASE_URL="https://yourdomain.com/api"

# 3. Launch with Docker Compose:
docker-compose up -d --build
```
This builds and starts:
- The Spring Boot backend container listening on port `8080`.
- The React SPA container served by high-performance Nginx listening on port `80`.

---

## 📂 Project Architecture

```
├── backend/
│   ├── src/main/java/com/expensetracker/
│   │   ├── config/          # MongoConfig (Decimal128 converters), DatabaseDataInitializer
│   │   ├── controller/      # Auth, Transaction, Category, Budget, Recurring, Report, Admin
│   │   ├── dto/             # Request/Response payloads with JSR-380 validation
│   │   ├── exception/       # GlobalExceptionHandler, ResourceNotFound, BadRequest
│   │   ├── model/           # User, Transaction, Category, Budget, Recurring, AuditLog
│   │   ├── repository/      # MongoRepository interfaces with custom query methods
│   │   ├── scheduler/       # RecurringTransactionScheduler (@Scheduled worker)
│   │   ├── security/        # JwtTokenProvider, JwtAuthenticationFilter, SecurityConfig
│   │   └── service/         # Business logic with Spring transactions and audit logging
│   ├── pom.xml              # Spring Boot 3.3.5 dependencies
│   └── .env.example         # Template configuration for environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Preloader, Navbar, Sidebar, Modals, MetricCards, Skeletons
│   │   ├── context/         # AuthContext (JWT management, profile sync, logout)
│   │   ├── pages/           # Landing, Login, Register, Dashboard, Transactions, Budgets, etc.
│   │   ├── services/        # Axios client instance with Bearer interceptor & error handling
│   │   ├── index.css        # Custom monochrome theme tokens and animations
│   │   └── App.jsx          # Protected route hierarchy and layout bindings
│   ├── tailwind.config.js   # Tailored black/white palette tokens
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## 🛡 Security & Design Principles

1. **Strict Data Isolation**: Every transaction, budget, recurring rule, and custom category is explicitly tied to `userId` derived directly from the authenticated JWT token—never accepted blindly from request parameters.
2. **Zero Plaintext Secrets**: Passwords are encrypted with BCrypt (10 rounds). Tokens are signed with HMAC-SHA256.
3. **Category Integrity Engine**: When deleting a category with historical transactions, the application blocks accidental deletion with HTTP 409 and prompts the user to either **reassign transactions to another category** or **archive the category** so historical books remain balanced.
4. **CSV Ledger Export**: Authenticated users can export their entire financial ledger to standard RFC-4180 CSV with one click.
