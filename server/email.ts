import nodemailer from "nodemailer";
import { log } from "./index";

const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || process.env.SMTP_USER || "appointments@company.com";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

export function isEmailConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

export async function sendAppointmentNotification(params: {
  salespersonEmail: string;
  salespersonName: string;
  customerName: string;
  businessName: string;
  customerEmail: string;
  customerPhone: string;
  location: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
}): Promise<{ success: boolean; error?: string }> {
  const mailer = getTransporter();
  if (!mailer) {
    log("SMTP not configured — skipping email notification. Set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables to enable.", "email");
    return { success: false, error: "SMTP not configured" };
  }

  const formattedDate = (() => {
    const [y, m, d] = params.appointmentDate.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  })();

  const subject = `New Appointment: ${params.customerName} on ${formattedDate} at ${params.startTime}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">New Appointment Scheduled</h2>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <p>Hi ${params.salespersonName},</p>
        <p>A new appointment has been scheduled for you. Here are the details:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151; width: 140px;">Customer</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${params.customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Business</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${params.businessName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${params.customerEmail}">${params.customerEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Phone</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;"><a href="tel:${params.customerPhone}">${params.customerPhone}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Date</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Time</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${params.startTime} - ${params.endTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Location</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${params.location}</td>
          </tr>
        </table>

        <p style="color: #6b7280; font-size: 14px;">This appointment has also been added to your NetSuite calendar.</p>
      </div>
    </div>
  `;

  const text = `New Appointment Scheduled

Hi ${params.salespersonName},

A new appointment has been scheduled for you:

Customer: ${params.customerName}
Business: ${params.businessName}
Email: ${params.customerEmail}
Phone: ${params.customerPhone}
Date: ${formattedDate}
Time: ${params.startTime} - ${params.endTime}
Location: ${params.location}

This appointment has also been added to your NetSuite calendar.`;

  try {
    await mailer.sendMail({
      from: SMTP_FROM,
      to: params.salespersonEmail,
      subject,
      html,
      text,
    });

    log(`Email notification sent to ${params.salespersonEmail}`, "email");
    return { success: true };
  } catch (error: any) {
    log(`Failed to send email to ${params.salespersonEmail}: ${error.message}`, "email");
    return { success: false, error: error.message };
  }
}
