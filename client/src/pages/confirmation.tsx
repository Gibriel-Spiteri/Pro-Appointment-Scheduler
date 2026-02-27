import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CalendarDays, CheckCircle2, Clock, MapPin, User, Building2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentSummary {
  customerName: string;
  businessName?: string;
  customerEmail: string;
  customerPhone: string;
  location: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
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
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Appointment Scheduler</h1>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-1" data-testid="text-confirmation-title">
              Appointment Confirmed!
            </h2>
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

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium text-foreground" data-testid="text-summary-location">
                    {appointment.location}
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

          <div className="flex justify-center mt-6">
            <Button
              onClick={() => {
                sessionStorage.removeItem("lastAppointment");
                navigate("/");
              }}
              data-testid="button-book-another"
            >
              Book Another Appointment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
