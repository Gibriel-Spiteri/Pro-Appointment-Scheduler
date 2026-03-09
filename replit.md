# Appointment Scheduling Application

## Overview
A web-based appointment scheduling application built with React, Express, and TypeScript. Integrates with NetSuite via M2M OAuth2.0 to fetch live employee schedule and location data using SuiteQL. No hardcoded seed data — all schedule and location data comes from NetSuite in real time.

## Architecture

### Frontend (React + Vite)
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **UI**: Shadcn/ui components + Tailwind CSS

### Backend (Express)
- **Server**: Express.js with TypeScript
- **Storage**: In-memory storage (MemStorage) for appointments only; locations and schedules fetched live from NetSuite
- **API Routes**: `/api/locations`, `/api/availability`, `/api/appointments`, `/api/netsuite/*`
- **NetSuite Integration**: OAuth 2.0 M2M with certificate-based JWT (PS256)

## NetSuite Integration
- **Auth**: OAuth 2.0 Client Credentials (M2M) flow using PS256-signed JWT
- **Library**: `jsonwebtoken` for JWT signing
- **Module**: `server/netsuite.ts` — handles token acquisition, caching, SuiteQL execution, and live data fetching
- **Certificates**: Stored in `server/certs/` (private_key.pem, certificate.pem) — gitignored
- **Env Vars Required**:
  - `NETSUITE_ACCOUNT_ID` — NetSuite account ID (or full URL, auto-parsed)
  - `NETSUITE_OIDC_CLIENT_ID` — OAuth 2.0 Client ID from integration record
  - `NETSUITE_CERTIFICATE_ID` — Certificate ID (kid) from M2M setup
- **Live Data Functions**:
  - `fetchLocations()` — Queries employee locations filtered to customer-facing IDs (Commack=5, Copiague=2, East Meadow=4, Franklin Square=3, Patchogue=17); cached 10 min
  - `fetchSchedulesByDateAndLocation(date, locationId)` — Queries `customrecord_schedule` joined with `employee` for a given date/location
- **Data Format Conversions**:
  - Date: App uses "YYYY-MM-DD", NetSuite uses "M/D/YYYY" — converted by `formatDateForSuiteQL()`
  - Time: App uses "8:30 AM", NetSuite uses "08:30a" — converted by `parseNetSuiteTime()`
  - Boolean: NetSuite uses "T"/"F" strings for PTO and schedule change flags

## Pages
- `/` — Main scheduling page (calendar, time slots, location, customer form)
- `/confirmation` — Appointment summary shown after successful booking
- `/netsuite` — NetSuite connection dashboard (status, test connection, SuiteQL query)

## Key Features
- Interactive calendar for date selection (no past date selection)
- Live schedule-driven time slots from NetSuite employee schedule data
- Dynamic location loading from NetSuite (filtered to 5 customer-facing stores)
- Customer info form: Full Name, Business Name, Email, Mobile Number
- Fixed 60-minute appointment duration
- Appointments stored in-memory (no NetSuite appointment record)
- NetSuite SuiteQL query interface for live data access

## Data Flow & Caching
1. Frontend loads locations from `GET /api/locations` (fetched from NetSuite, cached 10 min)
2. On page load and each date change, frontend fires `POST /api/prefetch` with the selected date
3. Prefetch loads schedules AND calendar events for ALL locations on that date in parallel, cached server-side for 5 min
4. User selects location → `GET /api/availability?date=YYYY-MM-DD&location=<locationId>` returns instantly from cache
5. Time slots generated from schedule start/end times (30-min intervals, excluding PTO employees)
6. NetSuite calendar events (CALENDAR_EVENT with status CONFIRMED, excluding event types 10/12) block off overlapping time slots
7. Local in-memory appointments also block off their time ranges
8. User selects slot, fills form, submits → `POST /api/appointments`

## API
- `GET /api/locations` — Returns customer-facing locations from NetSuite
- `POST /api/prefetch` — Prefetches schedules for all locations on a given date `{ date: "YYYY-MM-DD" }`
- `GET /api/availability?date=YYYY-MM-DD&location=<locationId>` — Returns available/booked slots (location param is numeric NetSuite ID)
- `POST /api/appointments` — Creates a new appointment
- `GET /api/appointments` — Lists all appointments
- `GET /api/netsuite/status` — NetSuite config status
- `POST /api/netsuite/test` — Test NetSuite connection
- `POST /api/netsuite/query` — Execute SuiteQL query
