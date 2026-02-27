import { type User, type InsertUser, type Appointment, type InsertAppointment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentsByDateAndLocation(date: string, location: string): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private appointments: Map<string, Appointment>;

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.seedAppointments();
  }

  private seedAppointments() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    const seed: Appointment[] = [
      {
        id: randomUUID(),
        customerName: "John Smith",
        customerEmail: "john.smith@email.com",
        customerPhone: "(631) 555-0101",
        location: "Cabinet Direct",
        appointmentDate: dateStr,
        startTime: "10:00 AM",
        endTime: "11:00 AM",
        duration: 60,
        details: "Kitchen renovation consultation",
        status: "confirmed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        customerName: "Maria Garcia",
        customerEmail: "maria.garcia@email.com",
        customerPhone: "(631) 555-0202",
        location: "Cabinet Direct",
        appointmentDate: dateStr,
        startTime: "10:30 AM",
        endTime: "11:30 AM",
        duration: 60,
        details: "Bathroom cabinet design",
        status: "confirmed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        customerName: "Robert Johnson",
        customerEmail: "r.johnson@email.com",
        customerPhone: "(631) 555-0303",
        location: "Cabinet Direct",
        appointmentDate: dateStr,
        startTime: "11:00 AM",
        endTime: "12:00 PM",
        duration: 60,
        details: null,
        status: "confirmed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        customerName: "Lisa Chen",
        customerEmail: "lisa.chen@email.com",
        customerPhone: "(631) 555-0404",
        location: "East Meadow",
        appointmentDate: dateStr,
        startTime: "9:00 AM",
        endTime: "10:00 AM",
        duration: 60,
        details: "Living room built-ins",
        status: "confirmed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        customerName: "David Kim",
        customerEmail: "d.kim@email.com",
        customerPhone: "(631) 555-0505",
        location: "Commack",
        appointmentDate: dateStr,
        startTime: "1:00 PM",
        endTime: "2:00 PM",
        duration: 60,
        details: "Office cabinetry",
        status: "confirmed",
        createdAt: new Date(),
      },
    ];

    seed.forEach((appt) => this.appointments.set(appt.id, appt));
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
      status: "confirmed",
      createdAt: new Date(),
      details: insertAppointment.details ?? null,
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
}

export const storage = new MemStorage();
