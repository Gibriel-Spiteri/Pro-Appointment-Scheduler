import { callRestlet } from "./netsuite";
import { log } from "./index";

const APPOINTMENT_RESTLET_SCRIPT_ID = process.env.APPOINTMENT_RESTLET_SCRIPT_ID || "";
const APPOINTMENT_RESTLET_DEPLOY_ID = process.env.APPOINTMENT_RESTLET_DEPLOY_ID || "";

export function isLeadRestletConfigured(): boolean {
  return !!(APPOINTMENT_RESTLET_SCRIPT_ID && APPOINTMENT_RESTLET_DEPLOY_ID);
}

export async function createLeadViaRestlet(params: {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  businessName: string;
  businessType: string;
  annualProjects: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  password: string;
}): Promise<{ success: boolean; customerId?: string; error?: string }> {
  if (!isLeadRestletConfigured()) {
    log("Lead RESTlet not configured — skipping Lead creation. Set APPOINTMENT_RESTLET_SCRIPT_ID and APPOINTMENT_RESTLET_DEPLOY_ID environment variables.", "restlet");
    return { success: false, error: "Lead RESTlet not configured" };
  }

  try {
    const result = await callRestlet(APPOINTMENT_RESTLET_SCRIPT_ID, APPOINTMENT_RESTLET_DEPLOY_ID, "POST", {
      action: "createLead",
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      mobile: params.mobile.replace(/\D/g, ""),
      businessName: params.businessName,
      businessType: params.businessType,
      annualProjects: params.annualProjects,
      address: params.address,
      city: params.city,
      state: params.state,
      zip: params.zip,
      password: params.password,
    });

    if (result.success) {
      const customerId = result.data?.customerId ? String(result.data.customerId) : undefined;
      log(`Lead RESTlet succeeded — customerId: ${customerId || "none"}`, "restlet");
      return { success: true, customerId };
    } else {
      log(`Lead RESTlet failed: ${result.error}`, "restlet");
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    log(`Error calling lead RESTlet: ${error.message}`, "restlet");
    return { success: false, error: error.message };
  }
}

export function isAppointmentRestletConfigured(): boolean {
  return !!(APPOINTMENT_RESTLET_SCRIPT_ID && APPOINTMENT_RESTLET_DEPLOY_ID);
}

export async function createAppointmentViaRestlet(params: {
  salespersonId: string;
  salespersonEmail: string;
  salespersonName: string;
  customerName: string;
  businessName: string;
  customerEmail: string;
  customerPhone: string;
  location: string;
  locationId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  firstName?: string;
  lastName?: string;
  businessType?: string;
  annualProjects?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  password?: string;
  netsuiteCustomerId?: string;
}): Promise<{ success: boolean; eventId?: string; emailSent?: boolean; error?: string }> {
  if (!isAppointmentRestletConfigured()) {
    log("Appointment RESTlet not configured — skipping calendar event and email. Set APPOINTMENT_RESTLET_SCRIPT_ID and APPOINTMENT_RESTLET_DEPLOY_ID environment variables.", "restlet");
    return { success: false, error: "Appointment RESTlet not configured" };
  }

  try {
    const result = await callRestlet(APPOINTMENT_RESTLET_SCRIPT_ID, APPOINTMENT_RESTLET_DEPLOY_ID, "POST", {
      action: "createAppointment",
      salespersonId: params.salespersonId,
      salespersonEmail: params.salespersonEmail,
      salespersonName: params.salespersonName,
      customerName: params.customerName,
      businessName: params.businessName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      location: params.location,
      locationId: params.locationId,
      appointmentDate: params.appointmentDate,
      startTime: params.startTime,
      endTime: params.endTime,
      firstName: params.firstName,
      lastName: params.lastName,
      businessType: params.businessType,
      annualProjects: params.annualProjects,
      address: params.address,
      city: params.city,
      state: params.state,
      zip: params.zip,
      password: params.password,
      netsuiteCustomerId: params.netsuiteCustomerId,
    });

    if (result.success) {
      const eventId = result.data?.eventId ? String(result.data.eventId) : undefined;
      const emailSent = result.data?.emailSent === true;
      log(`Appointment RESTlet succeeded — eventId: ${eventId || "none"}, emailSent: ${emailSent}`, "restlet");
      return { success: true, eventId, emailSent };
    } else {
      log(`Appointment RESTlet failed: ${result.error}`, "restlet");
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    log(`Error calling appointment RESTlet: ${error.message}`, "restlet");
    return { success: false, error: error.message };
  }
}
