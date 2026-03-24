import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { User, Building2, Mail, Phone, MapPin, Briefcase, Lock } from "lucide-react";
import headerImg from "@assets/Consumers_Wholesale_1773370886421.jpg";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().min(10, "Please enter a valid phone number"),
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Please select a business type"),
  annualProjects: z.string().min(1, "Please select an option"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(5, "Please enter a valid ZIP code"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegistrationData = z.infer<typeof registrationSchema>;

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const BUSINESS_TYPES = [
  "Licensed Contractor",
  "Builder",
  "Property Manager",
  "Retailer / Dealer",
  "Architect / Designer",
  "Developer",
  "Other",
];

export const PRO_REGISTRATION_KEY = "proRegistration";

export default function Register() {
  const [, navigate] = useLocation();

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      businessName: "",
      businessType: "",
      annualProjects: "",
      address: "",
      city: "",
      state: "NY",
      zip: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const stored = sessionStorage.getItem(PRO_REGISTRATION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RegistrationData;
        form.reset(parsed);
      } catch {}
    }
  }, []);

  function onSubmit(data: RegistrationData) {
    const { confirmPassword, ...profileData } = data;
    sessionStorage.setItem(PRO_REGISTRATION_KEY, JSON.stringify(profileData));
    navigate("/schedule");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-5 py-3 flex justify-center">
          <h1
            className="tracking-wide text-[#01426a] text-[20px]"
            style={{ color: "#01426a", fontFamily: "'Outfit', sans-serif", fontWeight: 900, letterSpacing: "0.03em" }}
          >
            Sign Up for CONSUMERS Wholesale PROgram
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto w-full px-5 py-8 flex-1">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="rounded-lg border border-card-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Your Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                        <span className="text-foreground">First Name</span>
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John"
                          data-testid="input-first-name"
                          autoComplete="off"
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                        <span className="text-foreground">Last Name</span>
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Smith"
                          data-testid="input-last-name"
                          autoComplete="off"
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground">Business Name</span>
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Acme LLC"
                          data-testid="input-business-name"
                          autoComplete="off"
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground">Business Type</span>
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-business-type" className="text-sm">
                            <SelectValue placeholder="Select type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BUSINESS_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualProjects"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                        <span className="text-foreground">How many kitchen or bath projects do you do a year?</span>
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-annual-projects" className="text-sm">
                            <SelectValue placeholder="Select range..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-5">1–5</SelectItem>
                          <SelectItem value="6-15">6–15</SelectItem>
                          <SelectItem value="16-30">16–30</SelectItem>
                          <SelectItem value="31+">31+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground">Business Address</span>
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="123 Main Street"
                          data-testid="input-address"
                          autoComplete="off"
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                        <span className="text-foreground">City</span>
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="New York"
                          data-testid="input-city"
                          autoComplete="off"
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                          <span className="text-foreground">State</span>
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-state" className="text-sm">
                              <SelectValue placeholder="State" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {US_STATES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                          <span className="text-foreground">ZIP Code</span>
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="10001"
                            data-testid="input-zip"
                            autoComplete="off"
                            className="text-sm"
                            maxLength={10}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground">Email Address</span>
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="john@example.com"
                          data-testid="input-email"
                          autoComplete="off"
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground">Mobile Number</span>
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="(555) 000-0000"
                          data-testid="input-mobile"
                          autoComplete="off"
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground">Create Password</span>
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Min. 8 characters"
                          data-testid="input-password"
                          autoComplete="new-password"
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-foreground">Confirm Password</span>
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Re-enter password"
                          data-testid="input-confirm-password"
                          autoComplete="new-password"
                          className="text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                data-testid="button-continue"
                className="px-8"
              >
                Create My PRO Account
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
