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
- **Storage**: In-memory storage (MemStorage)
- **API Routes**: `/api/availability`, `/api/appointments`

## Pages
- `/` — Main scheduling page (calendar, time slots, location, customer form)
- `/confirmation` — Appointment summary shown after successful booking (data passed via sessionStorage)

## Key Features
- Interactive calendar for date selection (no past date selection)
- Time slot grid (8:30 AM – 7:00 PM in 30-min increments, 2 columns)
- Visual slot states: available, booked (red strikethrough), selected (green), duration-overlap (gray)
- Location selection (below calendar): East Meadow, Commack, Franklin Square, Copiague, Patchogue
- Customer info form: Full Name, Business Name (optional), Email, Mobile Number
- Fixed 60-minute appointment duration
- Confirmation page with full appointment summary after booking

## Data Model
- `appointments` table: customerName, businessName (optional), customerEmail, customerPhone, location, appointmentDate, startTime, endTime, duration, status

## Layout
- Customer Information: 4-column grid (Name, Business, Email, Phone)
- Below: 2-column layout [Left: Calendar + Store Location | Right: Time Slots]
- Footer: Cancel + Create Appointment buttons

## Planned NetSuite Integration
- M2M OAuth2.0 authentication
- Employee Event data to determine real-time availability
- Replace mock booked slots with live NetSuite data
