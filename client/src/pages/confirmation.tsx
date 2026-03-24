import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CalendarDays, Clock, MapPin, User, Building2, Mail, Phone } from "lucide-react";

interface AppointmentSummary {
  customerName: string;
  businessName?: string;
  customerEmail: string;
  customerPhone: string;
  location: string;
  locationAddress?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  salesPersonName?: string;
}

export default function Confirmation() {
  const [, navigate] = useLocation();
  const [appointment, setAppointment] = useState<AppointmentSummary | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("lastAppointment");
    if (stored) {
      setAppointment(JSON.parse(stored));
    } else {
      navigate("/");
    }
  }, []);

  if (!appointment) return null;

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-5 py-3 flex justify-center">
          <h1
            className="text-2xl tracking-wide"
            style={{ color: "#01426a", fontFamily: "'Outfit', sans-serif", fontWeight: 900 }}
            data-testid="text-confirmation-title"
          >
            You're booked. Here's what happens next:
          </h1>
        </div>
      </header>
      <div className="max-w-3xl mx-auto w-full px-5 py-4 flex-1">

        <div className="mb-4 rounded-lg border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            <div className="px-4 py-4 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Check your phone and email</p>
                <p className="text-sm text-muted-foreground mt-0.5">Your confirmation and meeting details are on the way to your phone and email</p>
              </div>
            </div>
            <div className="px-4 py-4 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">What to expect</p>
                <p className="text-sm text-muted-foreground mt-0.5">You're about to see how contractors are selling kitchens without adding overhead</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-border bg-muted/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/40">
            <p className="text-center font-extrabold text-[20px] text-[#01426a]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900 }}>
              Consumers Wholesale PROgram Meeting
            </p>
          </div>
          <div className="px-4 py-3 text-muted-foreground text-center text-[16px]">
            {formatDate(appointment.appointmentDate)}
          </div>
        </div>

        <div className="rounded-lg border border-card-border bg-card p-4 space-y-4">
          <h3 className="text-xs uppercase tracking-wider text-[#171717] text-left font-bold">Appointment Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-medium text-foreground" data-testid="text-summary-time">
                  {appointment.startTime} – {appointment.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium text-foreground" data-testid="text-summary-location">
                  {appointment.locationAddress || appointment.location}
                </p>
              </div>
            </div>

            {appointment.salesPersonName && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Meeting with</p>
                  <p className="text-sm font-medium text-foreground" data-testid="text-summary-salesperson">
                    {appointment.salesPersonName}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <CalendarDays className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium text-foreground" data-testid="text-summary-date">
                  {formatDate(appointment.appointmentDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-xs uppercase tracking-wider mb-3 text-[#171717] font-bold">Your Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-foreground" data-testid="text-summary-name">
                    {appointment.customerName}
                  </p>
                </div>
              </div>

              {appointment.businessName && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Business</p>
                    <p className="text-sm font-medium text-foreground" data-testid="text-summary-business">
                      {appointment.businessName}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground" data-testid="text-summary-email">
                    {appointment.customerEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground" data-testid="text-summary-phone">
                    {appointment.customerPhone}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
