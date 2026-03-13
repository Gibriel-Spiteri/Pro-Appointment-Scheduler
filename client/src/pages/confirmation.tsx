import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CalendarDays, Clock, MapPin, User, Building2, Mail, Phone, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground text-center" data-testid="text-confirmation-title">Appointment Confirmed!</h1>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-6 pt-10 pb-4">
        <div className="w-full max-w-lg">
          <div className="flex flex-col items-center text-center mb-8">
            <p className="text-muted-foreground text-sm">
              Your appointment has been successfully booked. You will receive a confirmation shortly.
            </p>
          </div>

          <div className="rounded-lg border border-card-border bg-card p-6 space-y-5">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Appointment Summary
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium text-foreground" data-testid="text-summary-date">
                    {formatDate(appointment.appointmentDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-medium text-foreground" data-testid="text-summary-time">
                    {appointment.startTime} – {appointment.endTime}
                  </p>
                </div>
              </div>

              {appointment.salesPersonName && (
                <div className="flex items-start gap-3">
                  <UserCheck className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Scheduled with</p>
                    <p className="text-sm font-medium text-foreground" data-testid="text-summary-salesperson">
                      {appointment.salesPersonName}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium text-foreground" data-testid="text-summary-location">
                    {appointment.locationAddress || appointment.location}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-medium text-foreground" data-testid="text-summary-name">
                      {appointment.customerName}
                    </p>
                  </div>
                </div>

                {appointment.businessName && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Business</p>
                      <p className="text-sm font-medium text-foreground" data-testid="text-summary-business">
                        {appointment.businessName}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground" data-testid="text-summary-email">
                      {appointment.customerEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
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
    </div>
  );
}
