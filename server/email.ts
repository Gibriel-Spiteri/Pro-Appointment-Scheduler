import { callRestlet } from "./netsuite";
import { log } from "./index";

const EMAIL_RESTLET_SCRIPT_ID = process.env.EMAIL_RESTLET_SCRIPT_ID || "";
const EMAIL_RESTLET_DEPLOY_ID = process.env.EMAIL_RESTLET_DEPLOY_ID || "";

export function isEmailRestletConfigured(): boolean {
  return !!(EMAIL_RESTLET_SCRIPT_ID && EMAIL_RESTLET_DEPLOY_ID);
}

export async function sendAppointmentNotification(params: {
  salespersonEmail: string;
  salespersonName: string;
  salespersonId: string;
  customerName: string;
  businessName: string;
  customerEmail: string;
  customerPhone: string;
  location: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isEmailRestletConfigured()) {
    log("Email RESTlet not configured — skipping email notification. Set EMAIL_RESTLET_SCRIPT_ID and EMAIL_RESTLET_DEPLOY_ID environment variables.", "email");
    return { success: false, error: "Email RESTlet not configured" };
  }

  try {
    const result = await callRestlet(EMAIL_RESTLET_SCRIPT_ID, EMAIL_RESTLET_DEPLOY_ID, "POST", {
      action: "sendAppointmentEmail",
      recipientEmployeeId: params.salespersonId,
      recipientEmail: params.salespersonEmail,
      recipientName: params.salespersonName,
      customerName: params.customerName,
      businessName: params.businessName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      location: params.location,
      appointmentDate: params.appointmentDate,
      startTime: params.startTime,
      endTime: params.endTime,
    });

    if (result.success) {
      log(`Email notification triggered via RESTlet for ${params.salespersonEmail}`, "email");
      return { success: true };
    } else {
      log(`RESTlet email notification failed: ${result.error}`, "email");
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    log(`Error calling email RESTlet: ${error.message}`, "email");
    return { success: false, error: error.message };
  }
}
