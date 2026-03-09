import { type User, type InsertUser, type Appointment, type InsertAppointment } from "@shared/schema";
import { randomUUID } from "crypto";
import { fetchSchedulesByDateAndLocation, fetchLocations, type NetSuiteSchedule, type NetSuiteLocation } from "./netsuite";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentsByDateAndLocation(date: string, location: string): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  getLocations(): Promise<NetSuiteLocation[]>;
  getSchedulesByDateAndLocation(date: string, locationId: string): Promise<NetSuiteSchedule[]>;
}

function timeToMinutes(t: string): number {
  const [time, period] = t.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h < 12 ? "AM" : "PM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")} ${period}`;
}

export function generateTimeSlotsFromSchedules(schedules: NetSuiteSchedule[]): string[] {
  const activeSchedules = schedules.filter((s) => !s.pto && !s.scheduleChange);
  if (activeSchedules.length === 0) return [];

  let earliestStart = Infinity;
  let latestEnd = -Infinity;
  for (const s of activeSchedules) {
    const start = timeToMinutes(s.startTime);
    const end = timeToMinutes(s.endTime);
    if (start < earliestStart) earliestStart = start;
    if (end > latestEnd) latestEnd = end;
  }

  const slots: string[] = [];
  let current = earliestStart;
  while (current < latestEnd) {
    slots.push(minutesToTime(current));
    current += 30;
  }
  return slots;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private appointments: Map<string, Appointment>;
  private locationsCache: { data: NetSuiteLocation[]; expiresAt: number } | null = null;

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      businessName: insertAppointment.businessName,
      status: "confirmed",
      createdAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAppointmentsByDateAndLocation(date: string, location: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appt) => appt.appointmentDate === date && appt.location === location
    );
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getLocations(): Promise<NetSuiteLocation[]> {
    if (this.locationsCache && Date.now() < this.locationsCache.expiresAt) {
      return this.locationsCache.data;
    }

    const locations = await fetchLocations();
    this.locationsCache = {
      data: locations,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
    return locations;
  }

  async getSchedulesByDateAndLocation(date: string, locationId: string): Promise<NetSuiteSchedule[]> {
    return fetchSchedulesByDateAndLocation(date, locationId);
  }
}

export const storage = new MemStorage();
