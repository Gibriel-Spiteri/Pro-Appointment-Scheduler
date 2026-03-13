import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CalendarDays, Clock, MapPin, User, Building2, Eye } from "lucide-react";
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold text-foreground text-center" data-testid="text-confirmation-title">
            Appointment Confirmed!
          </h1>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-6 pt-8 pb-8">
        <div className="w-full max-w-2xl">
          <div className="rounded-xl border border-card-border bg-card overflow-hidden shadow-sm">
            <div className="bg-primary px-6 py-5">
              <div className="flex items-center gap-2 text-primary-foreground/80 text-xs mb-1">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Appointment Invitation</span>
              </div>
              <h2 className="text-xl font-bold text-primary-foreground">
                Consumers Wholesale PROgram Meeting
              </h2>
              <p className="text-primary-foreground/80 text-sm mt-1">
                {formatDate(appointment.appointmentDate)}
              </p>
            </div>

            <div className="px-6 py-5 space-y-4">
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

              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground mb-3">Attendee</p>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground" data-testid="text-summary-name">
                      {appointment.customerName}
                    </p>
                    {appointment.businessName && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5" data-testid="text-summary-business">
                        <Building2 className="w-3 h-3" /> {appointment.businessName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-summary-email">
                      {appointment.customerEmail}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-summary-phone">
                      {appointment.customerPhone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You're invited to a 20-minute meeting with a Store Manager to learn about the profit structure, volume rebates, portal access, and how we service you and your customer. A calendar invite will be sent to your email shortly.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button
              type="button"
              variant="default"
              data-testid="button-appt-preview"
              onClick={() => navigate("/appointment-preview")}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              See Appointment Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
