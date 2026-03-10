import { callRestlet } from "./netsuite";
import { log } from "./index";

const APPOINTMENT_RESTLET_SCRIPT_ID = process.env.APPOINTMENT_RESTLET_SCRIPT_ID || "";
const APPOINTMENT_RESTLET_DEPLOY_ID = process.env.APPOINTMENT_RESTLET_DEPLOY_ID || "";

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
