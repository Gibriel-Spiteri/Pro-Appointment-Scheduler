import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, TrendingUp, BarChart3, Globe, Handshake, CheckCircle2 } from "lucide-react";
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

export default function AppointmentPreview() {
  const [, navigate] = useLocation();
  const [appointment, setAppointment] = useState<AppointmentSummary | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("lastAppointment");
    if (stored) {
      setAppointment(JSON.parse(stored));
    } else {
      navigate("/confirmation");
    }
  }, []);

  if (!appointment) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate("/confirmation")}
            className="flex items-center gap-1 -ml-2"
            data-testid="button-back-to-confirmation"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <span className="text-base font-semibold text-foreground">Your Appointment</span>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-6 pt-8 pb-10">
        <div className="w-full max-w-2xl space-y-6">

          <div className="text-center px-2">
            <p className="text-lg font-semibold text-foreground">Here's what we'll cover in your 20 minutes</p>
            <p className="text-sm text-muted-foreground mt-1">Built exclusively for pros like you — don't miss it.</p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Profit Structure</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Understand exactly how our contractor pricing works and how much margin you keep on every job. We'll walk you through the numbers so you can quote confidently and protect your bottom line.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Trade pricing", "Job-lot discounts", "Transparent margins"].map((tag) => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Volume Rebates</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The more you buy, the more you earn back. Our volume rebate program rewards your loyalty with meaningful returns at the end of each period — money that goes straight to your business.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Tiered rebates", "Annual payout", "No minimum to start"].map((tag) => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 px-6 py-5 border-b border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">PRO Portal Access</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get 24/7 access to your account, order history, invoices, and pricing through our dedicated PRO portal. Place orders, track deliveries, and manage your account from any device — anytime.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Online ordering", "Order tracking", "Account dashboard"].map((tag) => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 px-6 py-5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Handshake className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">How We Service You & Your Customer</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  From job-site delivery to showroom support for your homeowners, we're here as an extension of your business. Your customers get a premium experience — and you get the credit.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["Job-site delivery", "Showroom for your clients", "Dedicated account rep"].map((tag) => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-primary/5 border border-primary/20 px-6 py-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Just 20 minutes — big impact</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Contractors who join the PROgram save more, earn rebates, and win more jobs. We'll show you the exact numbers at your appointment. See you there, {appointment.customerName.split(" ")[0]}.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
