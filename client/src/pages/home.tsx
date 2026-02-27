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
import { apiRequest } from "@/lib/queryClient";
import { bookAppointmentSchema, type BookAppointment } from "@shared/schema";
import { cn } from "@/lib/utils";

const LOCATIONS = [
  "Commack",
  "Copiague",
  "East Meadow",
  "Franklin Square",
  "Patchogue",
];

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DURATION = 60;

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const start = { h: 8, m: 30 };
  const end = { h: 19, m: 0 };
  let h = start.h;
  let m = start.m;
  while (h < end.h || (h === end.h && m <= end.m)) {
    const period = h < 12 ? "AM" : "PM";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    slots.push(`${displayH}:${m.toString().padStart(2, "0")} ${period}`);
    m += 30;
    if (m >= 60) { m = 0; h++; }
  }
  return slots;
}

const ALL_TIME_SLOTS = generateTimeSlots();

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
      <div className="flex items-center justify-between mb-4">
        <button
          data-testid="button-prev-month"
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover-elevate border border-border bg-background"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {MONTHS[month]} {year}
        </span>
        <button
          data-testid="button-next-month"
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover-elevate border border-border bg-background"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-sm font-semibold text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
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
              data-testid={`button-date-${toLocalDateStr(cell.date)}`}
              onClick={() => !isPast && cell.currentMonth && onDateSelect(cell.date)}
              className={cn(
                "h-12 w-full flex items-center justify-center text-base rounded-md transition-colors",
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

function TimeSlotGrid({
  slots,
  bookedSlots,
  selectedSlot,
  onSelect,
}: {
  slots: string[];
  bookedSlots: { startTime: string; endTime: string }[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
}) {
  const pairs: [string, string | null][] = [];
  for (let i = 0; i < slots.length; i += 2) {
    pairs.push([slots[i], slots[i + 1] ?? null]);
  }

  const selectedStartMin = selectedSlot ? timeToMinutes(selectedSlot) : null;
  const selectedEndMin = selectedStartMin !== null ? selectedStartMin + DURATION : null;

  function getSlotState(slot: string): "available" | "booked" | "selected" | "duration-overlap" {
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
    <div className="space-y-1.5">
      {pairs.map(([left, right], idx) => (
        <div key={idx} className="grid grid-cols-2 gap-2">
          {[left, right].map((slot, si) => {
            if (!slot) return <div key={si} />;
            const state = getSlotState(slot);
            return (
              <button
                key={si}
                data-testid={`button-timeslot-${slot.replace(/[: ]/g, "-")}`}
                disabled={state === "booked" || state === "duration-overlap"}
                onClick={() => state === "available" && onSelect(slot)}
                className={cn(
                  "relative h-9 flex items-center justify-center text-base font-medium rounded-md border transition-all",
                  state === "available" &&
                    "bg-background border-border text-foreground hover-elevate cursor-pointer",
                  state === "selected" &&
                    "bg-green-500 border-green-500 text-white font-semibold",
                  state === "duration-overlap" &&
                    "bg-muted/60 border-muted text-muted-foreground cursor-not-allowed",
                  state === "booked" &&
                    "cursor-not-allowed border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30",
                )}
              >
                {state === "booked" ? (
                  <span className="relative">
                    <span className="text-red-400 line-through decoration-red-400 text-sm">{slot}</span>
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

export default function Home() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date(today));
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

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

  const dateStr = toLocalDateStr(selectedDate);

  const { data: availabilityData, isLoading: availabilityLoading } = useQuery<{
    bookedSlots: { startTime: string; endTime: string }[];
  }>({
    queryKey: ["/api/availability", dateStr, selectedLocation],
    queryFn: () =>
      fetch(`/api/availability?date=${dateStr}&location=${encodeURIComponent(selectedLocation)}`).then(
        (r) => r.json()
      ),
    enabled: !!selectedLocation,
  });

  const bookedSlots = availabilityData?.bookedSlots ?? [];

  useEffect(() => {
    form.setValue("location", selectedLocation);
  }, [selectedLocation]);

  useEffect(() => {
    form.setValue("appointmentDate", dateStr);
    setSelectedSlot(null);
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
    mutationFn: (data: BookAppointment) => apiRequest("POST", "/api/appointments", data),
    onSuccess: (_res, variables) => {
      sessionStorage.setItem("lastAppointment", JSON.stringify({
        customerName: variables.customerName,
        businessName: variables.businessName || undefined,
        customerEmail: variables.customerEmail,
        customerPhone: variables.customerPhone,
        location: variables.location,
        appointmentDate: variables.appointmentDate,
        startTime: variables.startTime,
        endTime: variables.endTime,
      }));
      navigate("/confirmation");
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "An error occurred while booking your appointment. Please try again.",
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
    setSelectedLocation("");
    form.reset();
  };

  const formatDisplayDate = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Appointment Scheduler</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full px-6 py-6 flex-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-lg border border-card-border bg-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <User className="w-3 h-3" /> Full Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John Smith"
                          data-testid="input-customer-name"
                          autoComplete="off"
                          className="text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="w-3 h-3" /> Business Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Company name"
                          data-testid="input-business-name"
                          autoComplete="off"
                          className="text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> Email Address <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="john@example.com"
                          data-testid="input-customer-email"
                          autoComplete="off"
                          className="text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> Mobile Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="(631) 555-0100"
                          data-testid="input-customer-phone"
                          autoComplete="off"
                          className="text-sm"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-5">
                <div className="rounded-lg border border-card-border bg-card p-5">
                  <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
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
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                      {formatDisplayDate(selectedDate)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-card-border bg-card p-5">
                  <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Store Location
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        data-testid={`button-location-${loc.replace(/\s+/g, "-").toLowerCase()}`}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setSelectedSlot(null);
                        }}
                        className={cn(
                          "h-9 px-2 text-base font-medium rounded-md border transition-all text-center leading-tight",
                          selectedLocation === loc
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-background border-border text-foreground hover-elevate"
                        )}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-card-border bg-card p-5">
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Select Time
                  {availabilityLoading && (
                    <span className="ml-auto text-xs text-muted-foreground animate-pulse">
                      Loading...
                    </span>
                  )}
                </h2>

                <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-3 border border-border rounded-sm bg-background" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-3 border border-red-200 rounded-sm bg-red-50 dark:bg-red-950/20" />
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-3 border border-green-500 rounded-sm bg-green-500" />
                    <span>Selected</span>
                  </div>
                </div>

                <TimeSlotGrid
                  slots={ALL_TIME_SLOTS}
                  bookedSlots={bookedSlots}
                  selectedSlot={selectedSlot}
                  onSelect={(slot) => setSelectedSlot(selectedSlot === slot ? null : slot)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 pb-4">
              <div />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  data-testid="button-cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-testid="button-create-appointment"
                  disabled={!selectedSlot || mutation.isPending}
                  className={cn(
                    "min-w-[160px]",
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
