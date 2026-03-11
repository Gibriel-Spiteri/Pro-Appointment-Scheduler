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
  - `fetchAvailableEmployeeForSlot(date, locationId, startTime, endTime)` — Finds an available salesperson by checking schedules and existing calendar events
  - `createNetSuiteCalendarEvent(params)` — Creates a calendar event via NetSuite REST Record API
  - `fetchEmployeeDetails(employeeId)` — Looks up employee name and email via SuiteQL
- **Appointment RESTlet Module**: `server/email.ts` — Calls a single NetSuite RESTlet that both creates the calendar event (using N/record) and sends the email notification (using N/email)
- **RESTlet Integration**: `callRestlet(scriptId, deployId, method, body)` in `server/netsuite.ts` — Generic function for calling any NetSuite RESTlet using OAuth2 M2M auth
- **Appointment RESTlet Env Vars** (required for calendar event + email):
  - `APPOINTMENT_RESTLET_SCRIPT_ID` — Script ID of the appointment RESTlet in NetSuite
  - `APPOINTMENT_RESTLET_DEPLOY_ID` — Deployment ID of the appointment RESTlet in NetSuite
- **Data Format Conversions**:
  - Date: App uses "YYYY-MM-DD", NetSuite uses "M/D/YYYY" — converted by `formatDateForSuiteQL()`
  - Time: App uses "8:30 AM", NetSuite uses "08:30a" — converted by `parseNetSuiteTime()`
  - Boolean: NetSuite uses "T"/"F" strings for PTO and schedule change flags

## Pages
- `/` — Main scheduling page (calendar, time slots, location, customer form)
- `/confirmation` — Appointment summary shown after successful booking
- `/netsuite` — NetSuite connection dashboard (status, test connection, SuiteQL query)
- `/training` — Animated employee training video for the Appointment Scheduler

## Training Video
- **Location**: `client/src/pages/training.tsx` renders `VideoTemplate` from `client/src/components/video/VideoTemplate.tsx`
- **Scene files**: `client/src/components/video/video_scenes/` (IntroScene, Step1-5, OutroScene)
- **Video hook**: `client/src/lib/video/hooks.ts` — `useVideoPlayer` manages scene timing, advancement, and looping
- **Libraries**: framer-motion (animations), gsap (complex timelines)
- **Features**: Auto-plays on load, loops continuously, 16:9 aspect ratio, 7 scenes covering the full booking workflow
- **Scenes**: Intro → Customer Info → Pick Date → Pick Location → Select Time → Confirm Booking → Outro/Confirmation

## Key Features
- Interactive calendar for date selection (no past date selection)
- Live schedule-driven time slots from NetSuite employee schedule data
- Dynamic location loading from NetSuite (filtered to 5 customer-facing stores)
- Customer info form: Full Name, Business Name, Email, Mobile Number
- Fixed 60-minute appointment duration
- **NetSuite Calendar Event creation** — When an appointment is booked, a calendar event is automatically created in NetSuite for the assigned salesperson via the REST Record API
- **Salesperson auto-assignment** — System finds an available employee at the selected location/time from NetSuite schedules, avoiding conflicts with existing calendar events
- **Email notification** — Salesperson receives an email notification about the new appointment (requires SMTP configuration)
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
9. Server auto-assigns an available salesperson from NetSuite schedules (avoids employees with conflicting calendar events)
10. Server calls a single NetSuite RESTlet that creates the calendar event and sends the salesperson an email notification (if `APPOINTMENT_RESTLET_SCRIPT_ID` and `APPOINTMENT_RESTLET_DEPLOY_ID` configured)

## API
- `GET /api/locations` — Returns customer-facing locations from NetSuite
- `POST /api/prefetch` — Prefetches schedules for all locations on a given date `{ date: "YYYY-MM-DD" }`
- `GET /api/availability?date=YYYY-MM-DD&location=<locationId>` — Returns available/booked slots (location param is numeric NetSuite ID)
- `POST /api/appointments` — Creates a new appointment, auto-assigns salesperson, creates NetSuite calendar event, sends email notification
- `GET /api/appointments` — Lists all appointments
- `GET /api/netsuite/status` — NetSuite config status
- `POST /api/netsuite/test` — Test NetSuite connection
- `POST /api/netsuite/query` — Execute SuiteQL query
