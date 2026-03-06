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
- Schedule-driven time slots: available slots are generated from employee schedule data (customrecord_schedule model)
- Each employee has a location; time slots for a location span from the earliest employee start time to the latest employee end time
- Employees on PTO are excluded from slot generation; Sundays have no schedules
- Visual slot states: available, booked (red strikethrough), selected (green), duration-overlap (gray)
- Location selection (below calendar): Commack, Copiague, East Meadow, Franklin Square, Patchogue
- Customer info form: Full Name, Business Name, Email, Mobile Number
- Fixed 60-minute appointment duration
- Confirmation page with full appointment summary after booking
- Empty state messaging when no location selected or no slots available

## Data Model
- `employees` table: id, name, location
- `employeeSchedules` table: id, employeeId, scheduleDate, startTime, endTime, pto, scheduleChange (mirrors NetSuite customrecord_schedule)
- `appointments` table: customerName, businessName, customerEmail, customerPhone, location, appointmentDate, startTime, endTime, duration, status

## API
- `GET /api/availability?date=YYYY-MM-DD&location=Name` — Returns `{ availableSlots: string[], bookedSlots: {startTime, endTime}[] }`
- `POST /api/appointments` — Creates a new appointment
- `GET /api/appointments` — Lists all appointments

## Layout
- Customer Information: 4-column grid (Name, Business, Email, Phone)
- Below: 2-column layout [Left: Calendar + Store Location | Right: Time Slots]
- Footer: Cancel + Create Appointment buttons

## Planned NetSuite Integration
- M2M OAuth2.0 authentication
- Fetch customrecord_schedule records for employee schedules
- Fetch employee records for location assignments
- Replace seed data with live NetSuite data
