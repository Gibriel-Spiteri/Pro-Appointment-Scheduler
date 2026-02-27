import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { bookAppointmentSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/availability", async (req, res) => {
    try {
      const { date, location } = req.query as { date: string; location: string };
      if (!date || !location) {
        return res.status(400).json({ error: "Date and location are required" });
      }
      const appointments = await storage.getAppointmentsByDateAndLocation(date, location);
      const bookedSlots = appointments.map((a) => ({ startTime: a.startTime, endTime: a.endTime }));
      res.json({ bookedSlots });
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

      const appointment = await storage.createAppointment({
        ...parsed.data,
        businessName: parsed.data.businessName ?? null,
      });

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

  return httpServer;
}
