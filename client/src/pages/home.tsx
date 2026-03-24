import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, User, Mail, Phone, Building2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { bookAppointmentSchema, type BookAppointment } from "@shared/schema";
import { cn } from "@/lib/utils";

interface Location {
  id: string;
  name: string;
  address?: string;
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DURATION = 30;

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function timeToMinutes(t: string): number {
  const [time, period] = t.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function addMinutes(t: string, mins: number): string {
  const total = timeToMinutes(t) + mins;
  let h = Math.floor(total / 60);
  const m = total % 60;
  const period = h < 12 ? "AM" : "PM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2, "0")} ${period}`;
}

function isSlotBooked(slot: string, bookedSlots: { startTime: string; endTime: string }[]): boolean {
  const slotStart = timeToMinutes(slot);
  const slotEnd = slotStart + 30;
  return bookedSlots.some((b) => {
    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime);
    return slotStart < bEnd && slotEnd > bStart;
  });
}

function CalendarWidget({
  selectedDate,
  onDateSelect,
}: {
  selectedDate: Date;
  onDateSelect: (d: Date) => void;
}) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { day: number; currentMonth: boolean; date: Date }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells.push({ day: d, currentMonth: false, date: new Date(year, month - 1, d) });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
  }

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          data-testid="button-prev-month"
          onClick={prevMonth}
          className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover-elevate border border-border bg-background"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-semibold text-foreground">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          data-testid="button-next-month"
          onClick={nextMonth}
          className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover-elevate border border-border bg-background"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-0.5">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          const cellDate = new Date(cell.date);
          cellDate.setHours(0, 0, 0, 0);
          const isToday = cellDate.getTime() === today.getTime();
          const isSelected =
            selectedDate.getFullYear() === cell.date.getFullYear() &&
            selectedDate.getMonth() === cell.date.getMonth() &&
            selectedDate.getDate() === cell.date.getDate();
          const isPast = cellDate < today;

          return (
            <button
              key={idx}
              type="button"
              data-testid={`button-date-${toLocalDateStr(cell.date)}`}
              onClick={() => !isPast && cell.currentMonth && onDateSelect(cell.date)}
              className={cn(
                "h-7 w-full flex items-center justify-center text-xs rounded-md transition-colors",
                !cell.currentMonth && "text-muted-foreground/30",
                cell.currentMonth && isPast && "text-muted-foreground/40 cursor-not-allowed",
                cell.currentMonth && !isPast && !isSelected && !isToday && "text-foreground hover-elevate cursor-pointer",
                isToday && !isSelected && "text-primary font-bold",
                isSelected && "bg-primary text-primary-foreground font-semibold rounded-full",
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isSlotInPast(slot: string, selectedDate: Date): boolean {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  if (selected.getTime() !== today.getTime()) return false;
  const slotMinutes = timeToMinutes(slot);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return slotMinutes <= nowMinutes;
}

function TimeSlotGrid({
  slots,
  bookedSlots,
  selectedSlot,
  selectedDate,
  onSelect,
}: {
  slots: string[];
  bookedSlots: { startTime: string; endTime: string }[];
  selectedSlot: string | null;
  selectedDate: Date;
  onSelect: (slot: string) => void;
}) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    if (selected.getTime() !== today.getTime()) return;
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const pairs: [string, string | null][] = [];
  for (let i = 0; i < slots.length; i += 2) {
    pairs.push([slots[i], slots[i + 1] ?? null]);
  }

  const selectedStartMin = selectedSlot ? timeToMinutes(selectedSlot) : null;
  const selectedEndMin = selectedStartMin !== null ? selectedStartMin + DURATION : null;

  function getSlotState(slot: string): "available" | "booked" | "selected" | "duration-overlap" | "past" {
    if (isSlotInPast(slot, selectedDate)) return "past";
    if (isSlotBooked(slot, bookedSlots)) return "booked";
    if (slot === selectedSlot) return "selected";
    if (selectedStartMin !== null && selectedEndMin !== null) {
      const slotStart = timeToMinutes(slot);
      if (slotStart > selectedStartMin && slotStart < selectedEndMin) {
        return "duration-overlap";
      }
    }
    return "available";
  }

  return (
    <div className="space-y-1">
      {pairs.map(([left, right], idx) => (
        <div key={idx} className="grid grid-cols-2 gap-1.5">
          {[left, right].map((slot, si) => {
            if (!slot) return <div key={si} />;
            const state = getSlotState(slot);
            return (
              <button
                key={si}
                type="button"
                data-testid={`button-timeslot-${slot.replace(/[: ]/g, "-")}`}
                disabled={state === "booked" || state === "duration-overlap" || state === "past"}
                onClick={() => state === "available" && onSelect(slot)}
                className={cn(
                  "relative h-8 flex items-center justify-center text-[13px] font-medium rounded-md border transition-all",
                  state === "available" &&
                    "bg-background border-border text-foreground hover-elevate cursor-pointer",
                  state === "selected" &&
                    "bg-green-500 border-green-500 text-white font-semibold",
                  state === "duration-overlap" &&
                    "bg-muted/60 border-muted text-muted-foreground cursor-not-allowed",
                  state === "booked" &&
                    "cursor-not-allowed border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30",
                  state === "past" &&
                    "cursor-not-allowed border-muted bg-muted/40 text-muted-foreground/50",
                )}
              >
                {state === "booked" ? (
                  <span className="relative">
                    <span className="text-red-400 line-through decoration-red-400 text-[11px]">{slot}</span>
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                        <pattern id={`stripe-${idx}-${si}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                          <line x1="0" y1="0" x2="0" y2="4" stroke="#ef4444" strokeWidth="1.5" />
                        </pattern>
                        <rect width="100%" height="100%" fill={`url(#stripe-${idx}-${si})`} />
                      </svg>
                    </span>
                  </span>
                ) : (
                  <span>{slot}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const PRO_REGISTRATION_KEY = "proRegistration";

export default function Home() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date(today));
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [regData, setRegData] = useState<{ customerName: string; businessName: string; customerEmail: string; customerPhone: string; firstName: string } | null>(null);

  const { data: locationsData, isLoading: locationsLoading } = useQuery<{
    locations: Location[];
  }>({
    queryKey: ["/api/locations"],
  });

  const locations = locationsData?.locations ?? [];
  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  const form = useForm<BookAppointment>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: {
      customerName: "",
      businessName: "",
      customerEmail: "",
      customerPhone: "",
      location: "",
      appointmentDate: toLocalDateStr(today),
      startTime: "",
      endTime: "",
      duration: DURATION,
    },
  });

  useEffect(() => {
    const stored = sessionStorage.getItem(PRO_REGISTRATION_KEY);
    if (!stored) {
      navigate("/");
      return;
    }
    try {
      const reg = JSON.parse(stored);
      const customerName = `${reg.firstName ?? ""} ${reg.lastName ?? ""}`.trim();
      const businessName = reg.businessName ?? "";
      const customerEmail = reg.email ?? "";
      const customerPhone = reg.mobile ?? "";
      form.setValue("customerName", customerName);
      form.setValue("businessName", businessName);
      form.setValue("customerEmail", customerEmail);
      form.setValue("customerPhone", customerPhone);
      setRegData({ customerName, businessName, customerEmail, customerPhone, firstName: reg.firstName ?? "" });
    } catch {}
  }, []);

  const dateStr = toLocalDateStr(selectedDate);

  const { data: availabilityData, isLoading: availabilityLoading } = useQuery<{
    availableSlots: string[];
    bookedSlots: { startTime: string; endTime: string }[];
  }>({
    queryKey: ["/api/availability", dateStr, selectedLocationId],
    queryFn: async () => {
      const r = await fetch(`/api/availability?date=${dateStr}&location=${encodeURIComponent(selectedLocationId)}`);
      if (!r.ok) throw new Error("Failed to fetch availability");
      return r.json();
    },
    enabled: !!selectedLocationId,
  });

  const availableSlots = availabilityData?.availableSlots ?? [];
  const bookedSlots = availabilityData?.bookedSlots ?? [];

  useEffect(() => {
    form.setValue("location", selectedLocation?.name || "");
    form.setValue("locationId", selectedLocationId || "");
  }, [selectedLocationId]);

  useEffect(() => {
    form.setValue("appointmentDate", dateStr);
    setSelectedSlot(null);
    fetch("/api/prefetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr }),
    }).catch(() => {});
  }, [dateStr]);

  useEffect(() => {
    if (selectedSlot) {
      form.setValue("startTime", selectedSlot);
      form.setValue("endTime", addMinutes(selectedSlot, DURATION));
    } else {
      form.setValue("startTime", "");
      form.setValue("endTime", "");
    }
  }, [selectedSlot]);

  const mutation = useMutation({
    mutationFn: async (data: BookAppointment) => {
      const res = await apiRequest("POST", "/api/appointments", data);
      return res.json();
    },
    onSuccess: (res, variables) => {
      sessionStorage.setItem("lastAppointment", JSON.stringify({
        customerName: variables.customerName,
        businessName: variables.businessName || undefined,
        customerEmail: variables.customerEmail,
        customerPhone: variables.customerPhone,
        location: variables.location,
        locationAddress: selectedLocation?.address,
        appointmentDate: variables.appointmentDate,
        startTime: variables.startTime,
        endTime: variables.endTime,
        salesPersonName: res?.salesperson?.name,
      }));
      navigate("/confirmation");
    },
    onError: (error: Error) => {
      const isSlotTaken = error.message.includes("slot_taken");
      if (isSlotTaken) {
        setSelectedSlot(null);
        form.setValue("startTime", "");
        form.setValue("endTime", "");
        queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      }
      toast({
        title: isSlotTaken ? "Time slot no longer available" : "Booking failed",
        description: isSlotTaken
          ? "Sorry, this time slot was just taken. Please select a different time."
          : "An error occurred while booking your appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookAppointment) => {
    if (!selectedSlot) {
      toast({
        title: "Select a time slot",
        description: "Please select an available time slot before booking.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(data);
  };

  const handleCancel = () => {
    setSelectedSlot(null);
    setSelectedDate(new Date(today));
    setSelectedLocationId("");
    const stored = sessionStorage.getItem(PRO_REGISTRATION_KEY);
    let prefill = { customerName: "", businessName: "", customerEmail: "", customerPhone: "" };
    if (stored) {
      try {
        const reg = JSON.parse(stored);
        prefill = {
          customerName: `${reg.firstName ?? ""} ${reg.lastName ?? ""}`.trim(),
          businessName: reg.businessName ?? "",
          customerEmail: reg.email ?? "",
          customerPhone: reg.mobile ?? "",
        };
      } catch {}
    }
    form.reset({
      ...prefill,
      location: "",
      appointmentDate: toLocalDateStr(today),
      startTime: "",
      endTime: "",
      duration: DURATION,
    });
  };

  const formatDisplayDate = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-6xl mx-auto w-full px-5 py-2 flex-1">
        <div className="mb-5 rounded-lg border border-border bg-muted/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/40">
            <p className="text-center font-bold text-[20px]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900 }}>
              {regData?.firstName && <span>{regData.firstName}, </span>}Here's what you'll walk away with in 20 minutes
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
            <ul className="space-y-2 px-4 py-3">
              {[
                "Everything you need to know about the profit structure",
                "How the volume rebates work",
                "How we service you and your customer",
                "Everything you can do in the PROportal",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[#171717]">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="px-4 py-3 flex flex-col justify-center gap-1">
              <p className="text-sm font-medium text-foreground text-center">No obligation. No membership fee.</p>
              <p className="text-sm text-center font-medium text-[171717]">See the numbers. Decide for yourself.</p>
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="rounded-lg border border-card-border bg-card p-3">
                  <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    Select Date
                  </h2>
                  <CalendarWidget
                    selectedDate={selectedDate}
                    onDateSelect={(d) => {
                      setSelectedDate(d);
                      setSelectedSlot(null);
                    }}
                  />
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      {formatDisplayDate(selectedDate)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-card-border bg-card p-3">
                  <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Store Location
                  </h2>
                  {locationsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <p className="text-sm text-muted-foreground animate-pulse" data-testid="text-loading-locations">Loading locations...</p>
                    </div>
                  ) : locations.length === 0 ? (
                    <div className="flex items-center justify-center py-4">
                      <p className="text-sm text-muted-foreground" data-testid="text-no-locations">No locations available</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {locations.map((loc) => (
                          <button
                            key={loc.id}
                            type="button"
                            data-testid={`button-location-${loc.name.replace(/\s+/g, "-").toLowerCase()}`}
                            onClick={() => {
                              setSelectedLocationId(loc.id);
                              setSelectedSlot(null);
                            }}
                            className={cn(
                              "h-8 px-2 text-[13px] font-medium rounded-md border transition-all text-center leading-tight",
                              selectedLocationId === loc.id
                                ? "bg-green-500 border-green-500 text-white"
                                : "bg-background border-border text-foreground hover-elevate"
                            )}
                          >
                            {loc.name}
                          </button>
                        ))}
                      </div>
                      {selectedLocation?.address && (
                        <div className="mt-2 flex items-center justify-center gap-1.5 text-[13px] text-muted-foreground" data-testid="text-location-address">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                          <span>{selectedLocation.address}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-card-border bg-card p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Select Time
                  {availabilityLoading && (
                    <span className="ml-auto text-xs text-muted-foreground animate-pulse">
                      Loading...
                    </span>
                  )}
                </h2>

                <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-2.5 border border-border rounded-sm bg-background" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-2.5 border border-red-200 rounded-sm bg-red-50 dark:bg-red-950/20" />
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-2.5 border border-green-500 rounded-sm bg-green-500" />
                    <span>Selected</span>
                  </div>
                </div>

                {!selectedLocationId ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground" data-testid="text-select-location-prompt">
                    <MapPin className="w-7 h-7 mb-2 opacity-40" />
                    <p className="text-sm">Select a location to view available times</p>
                  </div>
                ) : availabilityLoading ? (
                  <div className="flex items-center justify-center py-8" data-testid="text-loading-slots">
                    <p className="text-sm text-muted-foreground animate-pulse">Loading time slots...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground" data-testid="text-no-slots">
                    <Clock className="w-7 h-7 mb-2 opacity-40" />
                    <p className="text-sm">No available time slots for this date and location</p>
                  </div>
                ) : (
                  <TimeSlotGrid
                    slots={availableSlots}
                    bookedSlots={bookedSlots}
                    selectedSlot={selectedSlot}
                    selectedDate={selectedDate}
                    onSelect={(slot) => setSelectedSlot(selectedSlot === slot ? null : slot)}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-end pt-1 pb-2">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="button-cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="button-back"
                  onClick={() => navigate("/")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  data-testid="button-create-appointment"
                  disabled={!selectedSlot || mutation.isPending}
                  className={cn(
                    "min-w-[140px]",
                    selectedSlot ? "bg-primary" : "opacity-60"
                  )}
                >
                  {mutation.isPending ? "Booking..." : "Create Appointment"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
