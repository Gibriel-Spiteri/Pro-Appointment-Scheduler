# Appointment Scheduling Application

## Overview
A web-based appointment scheduling application built with React, Express, and TypeScript. Designed to eventually integrate with NetSuite via M2M OAuth2.0 to display real-time employee availability.

## Architecture

### Frontend (React + Vite)
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **UI**: Shadcn/ui components + Tailwind CSS

### Backend (Express)
- **Server**: Express.js with TypeScript
- **Storage**: In-memory storage (MemStorage) — ready to swap with PostgreSQL + NetSuite when integration is added
- **API Routes**: `/api/availability`, `/api/appointments`

## Key Features
- Interactive calendar for date selection (no past date selection)
- Time slot grid (8:30 AM – 7:00 PM in 30-min increments, 2 columns)
- Visual slot states: available, booked (red strikethrough), selected (green), duration-overlap (gray)
- Location selection: Cabinet Direct, East Meadow, Commack, Franklin Square, Copiague, Patchogue
- Customer info form: Name, Email, Mobile Number
- Duration input (30–240 min, 30-min steps)
- Appointment details textarea
- Appointment summary panel
- Confirmation/success screen after booking

## Data Model
- `appointments` table: customerName, customerEmail, customerPhone, location, appointmentDate, startTime, endTime, duration, details, status

## Planned NetSuite Integration
- M2M OAuth2.0 authentication
- Employee Event data to determine real-time availability
- Replace mock booked slots with live NetSuite data

## File Structure
- `client/src/pages/home.tsx` — Main scheduling page (calendar, time slots, location, form)
- `server/routes.ts` — API endpoints
- `server/storage.ts` — MemStorage with seed data
- `shared/schema.ts` — Zod schemas and TypeScript types

## Color Scheme
- Primary (blue): `210 100% 45%`
- Selected/Active (green): Tailwind `green-500`
- Booked (red): Tailwind `red-400/50/200`
- Background: White / `0 0% 100%`
