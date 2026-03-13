import { Switch, Route } from "wouter";
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
