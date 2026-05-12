# 👗 Dress for Success — Prototype Web Application

A full-stack web prototype for Dress for Success — a charity that provides professional clothing and support services to help people enter the workforce with confidence.

---

## 🏗️ Architecture

```
DressForSuccess/
├── DressForSuccess.API/        ← ASP.NET Core 8 Web API (C#)
│   ├── Controllers/            ← Auth, Clients, Bookings, Volunteers, Products, Chat
│   ├── Models/                 ← Volunteer, Client, Booking, Product, ReferralAgency (enum)
│   ├── Data/                   ← EF Core DbContext + SQLite
│   └── DTOs/                   ← Request/Response objects
│
└── DressForSuccess.Web/        ← React + TypeScript (Vite)
    └── src/
        ├── pages/              ← Home, ClientServices, BookingForm, Store, Volunteer pages
        ├── components/         ← Navbar, Chatbot
        ├── context/            ← AuthContext (JWT)
        └── api/                ← Axios API client + TypeScript types
```

---

## 🚀 Getting Started

### Quick Start (Recommended)
```powershell
cd C:\DEV\LEN\DressForSuccess
powershell -ExecutionPolicy Bypass -File start.ps1
```
This opens two terminal windows (API + Frontend) and launches your browser at `http://localhost:3000`.

### Manual Start

**API (runs on port 5000):**
```powershell
cd DressForSuccess.API
dotnet run --no-launch-profile
```

**Frontend (runs on port 3000):**
```powershell
cd DressForSuccess.Web
node_modules\.bin\vite --port 3000
```

### PowerShell Scripts

All scripts are in the solution root (`C:\DEV\LEN\DressForSuccess`). Run with:
```powershell
powershell -ExecutionPolicy Bypass -File <script>.ps1
```

| Script | Description |
|--------|-------------|
| `start.ps1` | Kills existing processes, launches the API and Frontend in separate windows, and opens the browser |
| `seed-data.ps1` | Populates the database with 3 volunteers, 5 clients, and 7 bookings across all statuses |
| `clear-database.ps1` | Stops the API, deletes the SQLite database file, and prints restart instructions |

**Typical workflow — fresh start with test data:**
```powershell
cd C:\DEV\LEN\DressForSuccess
.\clear-database.ps1          # Wipe the database
.\start.ps1                   # Start API + Frontend
# Wait a few seconds for the API to be ready, then:
.\seed-data.ps1               # Populate test data
```

**Seed data summary:**

| Entity | Count | Details |
|--------|-------|---------|
| Volunteers | 3 | Sarah Mitchell, David Chen, Priya Patel |
| Clients | 5 | Each with a different referral agency |
| Bookings | 7 | 1 Scheduled, 3 Confirmed, 2 Completed, 1 Cancelled |

**Test logins (created by `seed-data.ps1`):**

| Email | Password |
|-------|----------|
| `sarah.mitchell@dfs.org` | `Volunteer1!` |
| `david.chen@dfs.org` | `Volunteer2!` |
| `priya.patel@dfs.org` | `Volunteer3!` |

---

## 🌐 Pages & Features

| Page | URL | Description |
|------|-----|-------------|
| **Home** | `/` | Landing page with portal cards and chatbot |
| **Client Services** | `/client-services` | Service overview + booking entry point |
| **Book Appointment** | `/client-services` → Book | 2-step booking form (client details + appointment) |
| **Store** | `/store` | Product catalogue with category filter |
| **Volunteer Login** | `/volunteer/login` | JWT-authenticated login |
| **Volunteer Register** | `/volunteer/register` | Create new volunteer account |
| **Volunteer Dashboard** | `/volunteer/dashboard` | Stats + upcoming appointments |
| **Booking Management** | `/volunteer/bookings` | Assign volunteers, complete, cancel bookings |

---

## 🤖 Chatbot

The chatbot appears as a floating button (💬) on the home and client services pages.

- **With OpenAI key**: Add your key to `appsettings.json` → `OpenAI:ApiKey` for GPT-3.5 powered responses
- **Without key**: Falls back to intelligent rule-based responses covering bookings, store, referrals, and volunteering
- Quick reply buttons for common queries
- Conversation history maintained per session

---

## 📋 Booking Workflow

1. **Client books** via Client Services → 2-step form captures all required data
2. **Referral agency** selected from enumerated list (Self Referral, Social Services, Employment Agency, etc.)
3. **Booking created** in `Scheduled` status
4. **Volunteer assigns** themselves or an admin assigns via Booking Management page
5. **Status → Confirmed** once a volunteer is assigned
6. **After appointment**: Volunteer marks as **Completed** with outcome notes, or **Cancelled** with reason
7. Full audit trail: completion timestamp, outcome notes, cancellation reason all captured

---

## 🏪 Store

- Product catalogue with seeded sample data (blazers, trousers, dresses, etc.)
- Filter by category
- Add to cart (UI prototype — checkout coming soon)

---

## 🔐 Authentication

- Volunteers register with email + password (BCrypt hashed)
- JWT tokens issued on login, stored in `localStorage`
- Protected routes redirect to login if unauthenticated

---

## 🗄️ Database

SQLite database (`dressforsuccess.db`) is auto-created on first run in the API project folder.

### Referral Agencies (Enum)
| Value | Name |
|-------|------|
| 0 | Self Referral |
| 1 | Social Services |
| 2 | Community Center |
| 3 | Employment Agency |
| 4 | Mental Health Organization |
| 5 | Women's Refuge |
| 6 | Homeless Shelter |
| 7 | Food Bank |
| 8 | Government Agency |
| 9 | Church / Religious Org |
| 10 | School or College |
| 99 | Other |

### Booking Statuses
`Scheduled` → `Confirmed` → `Completed` / `Cancelled` / `NoShow`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new volunteer |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/clients` | List all clients |
| POST | `/api/clients` | Create client |
| GET | `/api/clients/referral-agencies` | Enum list of referral agencies |
| GET | `/api/bookings` | All bookings |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/volunteer/{id}` | Bookings for a volunteer |
| PATCH | `/api/bookings/{id}/assign-volunteer` | Assign volunteer |
| PATCH | `/api/bookings/{id}/complete` | Mark completed + outcome notes |
| PATCH | `/api/bookings/{id}/cancel` | Cancel with reason |
| GET | `/api/volunteers` | List all volunteers |
| GET | `/api/products` | List products (optional `?category=`) |
| GET | `/api/products/categories` | Available categories |
| POST | `/api/chat` | Chatbot message (supports OpenAI or rule-based) |

---

## ⚙️ Configuration

Edit `DressForSuccess.API/appsettings.json`:

```json
{
  "OpenAI": {
    "ApiKey": "sk-..."   ← Add your OpenAI API key here for LLM chat
  }
}
```

---

## 🛣️ Next Steps (Beyond Prototype)

- [ ] Full checkout / payment processing in Store
- [ ] Email notifications for booking confirmation
- [ ] Admin portal for managing volunteers and clients
- [ ] Calendar view for scheduling
- [ ] Reporting & analytics dashboard
- [ ] Client login portal (separate from volunteers)
- [ ] SMS reminders for appointments

