import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, generateTimeSlotsFromSchedules } from "./storage";
import { bookAppointmentSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import { testConnection, executeSuiteQL, validateNetSuiteConfig } from "./netsuite";

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

      const schedules = await storage.getSchedulesByDateAndLocation(date, location);
      const availableSlots = generateTimeSlotsFromSchedules(schedules);

      const locations = await storage.getLocations();
      const loc = locations.find((l) => l.id === location);
      const locationName = loc?.name || location;

      const appointments = await storage.getAppointmentsByDateAndLocation(date, locationName);
      const bookedSlots = appointments.map((a) => ({ startTime: a.startTime, endTime: a.endTime }));

      res.json({ availableSlots, bookedSlots });
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

      const appointment = await storage.createAppointment(parsed.data);

      res.status(201).json({ success: true, appointment });
    } catch (error) {
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
