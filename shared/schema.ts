import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});


export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  businessName: text("business_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  location: text("location").notNull(),
  locationId: text("location_id"),
  appointmentDate: text("appointment_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  duration: integer("duration").notNull().default(60),
  salespersonId: text("salesperson_id"),
  salespersonName: text("salesperson_name"),
  netsuiteEventId: text("netsuite_event_id"),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const createLeadSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().min(10, "Please enter a valid phone number"),
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Please select a business type"),
  annualProjects: z.string().min(1, "Please select an option"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(5, "Please enter a valid ZIP code"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateLead = z.infer<typeof createLeadSchema>;

export const bookAppointmentSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  businessName: z.string().min(1, "Business name is required"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  location: z.string().min(1, "Please select a location"),
  locationId: z.string().optional(),
  appointmentDate: z.string().min(1, "Please select a date"),
  startTime: z.string().min(1, "Please select a time slot"),
  endTime: z.string().min(1, "End time is required"),
  duration: z.number().min(30).max(240),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  businessType: z.string().optional(),
  annualProjects: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  password: z.string().optional(),
  netsuiteCustomerId: z.string().optional(),
});


export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type BookAppointment = z.infer<typeof bookAppointmentSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
