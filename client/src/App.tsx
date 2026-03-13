import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Confirmation from "@/pages/confirmation";
import NetSuite from "@/pages/netsuite";
import Register from "@/pages/register";
import AppointmentPreview from "@/pages/appointment-preview";

const PAGES = [
  { label: "Register", path: "/" },
  { label: "Schedule", path: "/schedule" },
  { label: "Confirmation", path: "/confirmation" },
  { label: "Appointment Preview", path: "/appointment-preview" },
];

const SAMPLE_APPOINTMENT = {
  customerName: "John Smith",
  businessName: "Acme LLC",
  customerEmail: "john@example.com",
  customerPhone: "(631) 555-0100",
  location: "Yaphank",
  locationAddress: "95 Horseblock Rd., Yaphank, NY, 11980",
  appointmentDate: new Date().toISOString().split("T")[0],
  startTime: "10:00 AM",
  endTime: "10:30 AM",
  salesPersonName: "Store Manager",
};

const SAMPLE_REGISTRATION = {
  firstName: "John",
  lastName: "Smith",
  email: "john@example.com",
  mobile: "(631) 555-0100",
  businessName: "Acme LLC",
  businessType: "Contractor",
  address: "123 Main St",
  city: "Yaphank",
  state: "NY",
  zip: "11980",
};

function DebugNav() {
  const [location, navigate] = useLocation();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const path = e.target.value;
    if (path === "/confirmation" || path === "/appointment-preview") {
      sessionStorage.setItem("lastAppointment", JSON.stringify(SAMPLE_APPOINTMENT));
    }
    if (path === "/schedule") {
      sessionStorage.setItem("proRegistration", JSON.stringify(SAMPLE_REGISTRATION));
    }
    navigate(path);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 bg-black/80 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
      <span className="font-mono opacity-70">🛠 debug</span>
      <select
        value={location}
        onChange={handleChange}
        className="bg-black/60 text-white text-xs border border-white/20 rounded px-2 py-1 outline-none cursor-pointer"
      >
        {PAGES.map((p) => (
          <option key={p.path} value={p.path}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Register} />
      <Route path="/schedule" component={Home} />
      <Route path="/confirmation" component={Confirmation} />
      <Route path="/appointment-preview" component={AppointmentPreview} />
      <Route path="/netsuite" component={NetSuite} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <DebugNav />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
