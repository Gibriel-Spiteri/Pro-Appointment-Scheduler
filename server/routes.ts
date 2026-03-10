import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, generateTimeSlotsFromSchedules, filterAvailableSlots } from "./storage";
import { bookAppointmentSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import { testConnection, executeSuiteQL, validateNetSuiteConfig, fetchAvailableEmployeeForSlot } from "./netsuite";
import { createAppointmentViaRestlet } from "./email";
import { log } from "./index";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/locations", async (_req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json({ locations });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  app.post("/api/prefetch", async (req, res) => {
    try {
      const { date } = req.body;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
      }
      storage.prefetchSchedulesForDate(date);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to prefetch" });
    }
  });

  app.get("/api/availability", async (req, res) => {
    try {
      const { date, location } = req.query as { date: string; location: string };
      if (!date || !location) {
        return res.status(400).json({ error: "Date and location are required" });
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
      }
      if (!/^\d+$/.test(location)) {
        return res.status(400).json({ error: "Invalid location ID" });
      }

      const [schedules, events] = await Promise.all([
        storage.getSchedulesByDateAndLocation(date, location),
        storage.getEventsByDateAndLocation(date, location),
      ]);
      const allSlots = generateTimeSlotsFromSchedules(schedules);

      const locations = await storage.getLocations();
      const loc = locations.find((l) => l.id === location);
      const locationName = loc?.name || location;

      const localAppointments = await storage.getAppointmentsByDateAndLocation(date, locationName);

      const blockedSlots = events.map((e) => ({ startTime: e.startTime, endTime: e.endTime }));
      const localBookedSlots = localAppointments.map((a) => ({ startTime: a.startTime, endTime: a.endTime }));
      const bookedSlots = [...blockedSlots, ...localBookedSlots];

      res.json({ availableSlots: allSlots, bookedSlots });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const parsed = bookAppointmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      }

      const data = parsed.data;

      let salesperson: { id: string; name: string; email: string } | null = null;
      let netsuiteEventId: string | undefined;
      let emailSent = false;

      const locationId = data.locationId || "";

      if (locationId) {
        try {
          salesperson = await fetchAvailableEmployeeForSlot(
            data.appointmentDate,
            locationId,
            data.startTime,
            data.endTime
          );
        } catch (err: any) {
          log(`Failed to find available salesperson: ${err.message}`, "appointments");
        }
      }

      if (salesperson) {
        try {
          const restletResult = await createAppointmentViaRestlet({
            salespersonId: salesperson.id,
            salespersonEmail: salesperson.email,
            salespersonName: salesperson.name,
            customerName: data.customerName,
            businessName: data.businessName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            location: data.location,
            locationId: locationId,
            appointmentDate: data.appointmentDate,
            startTime: data.startTime,
            endTime: data.endTime,
          });

          if (restletResult.success) {
            netsuiteEventId = restletResult.eventId;
            emailSent = restletResult.emailSent || false;
            log(`Appointment RESTlet completed — eventId: ${netsuiteEventId}, emailSent: ${emailSent}`, "appointments");
          } else {
            log(`Appointment RESTlet failed: ${restletResult.error}`, "appointments");
          }
        } catch (err: any) {
          log(`Error calling appointment RESTlet: ${err.message}`, "appointments");
        }
      }

      const appointment = await storage.createAppointment({
        ...data,
        salespersonId: salesperson?.id,
        salespersonName: salesperson?.name,
        netsuiteEventId,
        locationId,
      });

      res.status(201).json({
        success: true,
        appointment,
        calendarEventCreated: !!netsuiteEventId,
        emailSent,
        salesperson: salesperson ? { id: salesperson.id, name: salesperson.name } : null,
      });
    } catch (error: any) {
      log(`Failed to create appointment: ${error.message}`, "appointments");
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json({ appointments });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.get("/api/netsuite/status", async (_req, res) => {
    try {
      const config = validateNetSuiteConfig();
      res.json({
        configured: config.valid,
        missing: config.missing,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check NetSuite configuration" });
    }
  });

  app.post("/api/netsuite/test", async (_req, res) => {
    try {
      const result = await testConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to test NetSuite connection" });
    }
  });

  app.post("/api/netsuite/query", async (req, res) => {
    try {
      const { query, limit = 1000, offset = 0 } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "A SuiteQL query string is required" });
      }
      const result = await executeSuiteQL(query, limit, offset);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to execute SuiteQL query" });
    }
  });

  return httpServer;
}
