import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
});

export const employeeSchedules = pgTable("employee_schedules", {
  id: varchar("id").primaryKey(),
  employeeId: varchar("employee_id").notNull(),
  scheduleDate: text("schedule_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  pto: boolean("pto").notNull().default(false),
  scheduleChange: boolean("schedule_change").notNull().default(false),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  businessName: text("business_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  location: text("location").notNull(),
  appointmentDate: text("appointment_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  duration: integer("duration").notNull().default(60),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const bookAppointmentSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  businessName: z.string().min(1, "Business name is required"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  location: z.string().min(1, "Please select a location"),
  appointmentDate: z.string().min(1, "Please select a date"),
  startTime: z.string().min(1, "Please select a time slot"),
  endTime: z.string().min(1, "End time is required"),
  duration: z.number().min(30).max(240),
});

export type Employee = typeof employees.$inferSelect;
export type EmployeeSchedule = typeof employeeSchedules.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type BookAppointment = z.infer<typeof bookAppointmentSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
