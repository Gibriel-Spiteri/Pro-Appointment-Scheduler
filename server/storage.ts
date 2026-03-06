import { type User, type InsertUser, type Appointment, type InsertAppointment, type Employee, type EmployeeSchedule } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentsByDateAndLocation(date: string, location: string): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  getEmployeesByLocation(location: string): Promise<Employee[]>;
  getSchedulesByDateAndLocation(date: string, location: string): Promise<EmployeeSchedule[]>;
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

export function generateTimeSlotsFromSchedules(schedules: EmployeeSchedule[]): string[] {
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
  private employees: Map<string, Employee>;
  private schedules: Map<string, EmployeeSchedule>;

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.employees = new Map();
    this.schedules = new Map();
    this.seedEmployees();
    this.seedSchedules();
    this.seedAppointments();
  }

  private seedEmployees() {
    const emps: Employee[] = [
      { id: "emp-1", name: "Alice Martinez", location: "East Meadow" },
      { id: "emp-2", name: "Bob Thompson", location: "East Meadow" },
      { id: "emp-3", name: "Carol Davis", location: "Commack" },
      { id: "emp-4", name: "Dan Wilson", location: "Commack" },
      { id: "emp-5", name: "Eva Brown", location: "Franklin Square" },
      { id: "emp-6", name: "Frank Lee", location: "Copiague" },
      { id: "emp-7", name: "Grace Kim", location: "Patchogue" },
      { id: "emp-8", name: "Henry Nguyen", location: "Patchogue" },
    ];
    emps.forEach((e) => this.employees.set(e.id, e));
  }

  private seedSchedules() {
    const today = new Date();
    const dates: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      dates.push(`${y}-${m}-${day}`);
    }

    const employeeScheduleTemplates: Record<string, { startTime: string; endTime: string }> = {
      "emp-1": { startTime: "9:00 AM", endTime: "5:00 PM" },
      "emp-2": { startTime: "10:00 AM", endTime: "6:00 PM" },
      "emp-3": { startTime: "8:30 AM", endTime: "4:30 PM" },
      "emp-4": { startTime: "11:00 AM", endTime: "7:00 PM" },
      "emp-5": { startTime: "9:00 AM", endTime: "5:00 PM" },
      "emp-6": { startTime: "10:00 AM", endTime: "6:00 PM" },
      "emp-7": { startTime: "8:00 AM", endTime: "4:00 PM" },
      "emp-8": { startTime: "12:00 PM", endTime: "7:00 PM" },
    };

    for (const date of dates) {
      for (const [empId, template] of Object.entries(employeeScheduleTemplates)) {
        const dayOfWeek = new Date(date + "T12:00:00").getDay();
        if (dayOfWeek === 0) continue;

        const isPto = empId === "emp-2" && date === dates[2];

        const schedule: EmployeeSchedule = {
          id: randomUUID(),
          employeeId: empId,
          scheduleDate: date,
          startTime: template.startTime,
          endTime: template.endTime,
          pto: isPto,
          scheduleChange: false,
        };
        this.schedules.set(schedule.id, schedule);
      }
    }
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
        businessName: "Smith Kitchens LLC",
        customerEmail: "john.smith@email.com",
        customerPhone: "(631) 555-0101",
        location: "East Meadow",
        appointmentDate: dateStr,
        startTime: "10:00 AM",
        endTime: "11:00 AM",
        duration: 60,
        status: "confirmed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        customerName: "Maria Garcia",
        businessName: "Garcia Designs",
        customerEmail: "maria.garcia@email.com",
        customerPhone: "(631) 555-0202",
        location: "East Meadow",
        appointmentDate: dateStr,
        startTime: "10:30 AM",
        endTime: "11:30 AM",
        duration: 60,
        status: "confirmed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        customerName: "Robert Johnson",
        businessName: "Johnson Interiors",
        customerEmail: "r.johnson@email.com",
        customerPhone: "(631) 555-0303",
        location: "East Meadow",
        appointmentDate: dateStr,
        startTime: "11:00 AM",
        endTime: "12:00 PM",
        duration: 60,
        status: "confirmed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        customerName: "Lisa Chen",
        businessName: "Chen Home Studio",
        customerEmail: "lisa.chen@email.com",
        customerPhone: "(631) 555-0404",
        location: "Commack",
        appointmentDate: dateStr,
        startTime: "9:00 AM",
        endTime: "10:00 AM",
        duration: 60,
        status: "confirmed",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        customerName: "David Kim",
        businessName: "Kim & Associates",
        customerEmail: "d.kim@email.com",
        customerPhone: "(631) 555-0505",
        location: "Commack",
        appointmentDate: dateStr,
        startTime: "1:00 PM",
        endTime: "2:00 PM",
        duration: 60,
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

  async getEmployeesByLocation(location: string): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter((e) => e.location === location);
  }

  async getSchedulesByDateAndLocation(date: string, location: string): Promise<EmployeeSchedule[]> {
    const locationEmployees = await this.getEmployeesByLocation(location);
    const employeeIds = new Set(locationEmployees.map((e) => e.id));
    return Array.from(this.schedules.values()).filter(
      (s) => s.scheduleDate === date && employeeIds.has(s.employeeId)
    );
  }
}

export const storage = new MemStorage();
