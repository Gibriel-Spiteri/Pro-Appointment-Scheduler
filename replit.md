# Appointment Scheduling Application

## Overview
A web-based appointment scheduling application built with React, Express, and TypeScript. Integrates with NetSuite via M2M OAuth2.0 to query live schedule data using SuiteQL.

## Architecture

### Frontend (React + Vite)
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **UI**: Shadcn/ui components + Tailwind CSS

### Backend (Express)
- **Server**: Express.js with TypeScript
- **Storage**: In-memory storage (MemStorage)
- **API Routes**: `/api/availability`, `/api/appointments`, `/api/netsuite/*`
- **NetSuite Integration**: OAuth 2.0 M2M with certificate-based JWT (PS256)

## NetSuite Integration
- **Auth**: OAuth 2.0 Client Credentials (M2M) flow using PS256-signed JWT
- **Library**: `jsonwebtoken` for JWT signing
- **Module**: `server/netsuite.ts` — handles token acquisition, caching, and SuiteQL execution
- **Certificates**: Stored in `server/certs/` (private_key.pem, certificate.pem)
- **Env Vars Required**:
  - `NETSUITE_ACCOUNT_ID` — NetSuite account ID (or full URL, auto-parsed)
  - `NETSUITE_OIDC_CLIENT_ID` — OAuth 2.0 Client ID from integration record
  - `NETSUITE_CERTIFICATE_ID` — Certificate ID (kid) from M2M setup
- **API Endpoints**:
  - `GET /api/netsuite/status` — Check credential configuration
  - `POST /api/netsuite/test` — Test live connection to NetSuite
  - `POST /api/netsuite/query` — Execute SuiteQL queries (`{ query, limit?, offset? }`)

## Pages
- `/` — Main scheduling page (calendar, time slots, location, customer form)
- `/confirmation` — Appointment summary shown after successful booking
- `/netsuite` — NetSuite connection dashboard (status, test connection, SuiteQL query)

## Key Features
- Interactive calendar for date selection (no past date selection)
- Schedule-driven time slots from employee schedule data
- Location selection: Commack, Copiague, East Meadow, Franklin Square, Patchogue
- Customer info form: Full Name, Business Name, Email, Mobile Number
- Fixed 60-minute appointment duration
- NetSuite SuiteQL query interface for live data access

## Data Model
- `employees` table: id, name, location
- `employeeSchedules` table: id, employeeId, scheduleDate, startTime, endTime, pto, scheduleChange
- `appointments` table: customerName, businessName, customerEmail, customerPhone, location, appointmentDate, startTime, endTime, duration, status

## API
- `GET /api/availability?date=YYYY-MM-DD&location=Name` — Returns available/booked slots
- `POST /api/appointments` — Creates a new appointment
- `GET /api/appointments` — Lists all appointments
- `GET /api/netsuite/status` — NetSuite config status
- `POST /api/netsuite/test` — Test NetSuite connection
- `POST /api/netsuite/query` — Execute SuiteQL query
