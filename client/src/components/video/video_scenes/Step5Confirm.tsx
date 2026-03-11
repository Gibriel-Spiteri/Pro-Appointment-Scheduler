import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { CheckCircle2, User, CalendarDays, MapPin, Clock } from "lucide-react";

const checkmarkUrl = `${import.meta.env.BASE_URL}video/checkmark-success.png`;

export function Step5Confirm() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const summaryItems = [
    { icon: User, label: "Customer", value: "Sarah Johnson" },
    { icon: CalendarDays, label: "Date", value: "Oct 15, 2024" },
    { icon: MapPin, label: "Location", value: "Westside Hub" },
    { icon: Clock, label: "Time", value: "11:30 AM – 12:30 PM" },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ clipPath: "circle(0% at 50% 100%)" }}
      animate={{ clipPath: "circle(120% at 50% 100%)" }}
      exit={{ clipPath: "circle(0% at 50% 0%)" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="text-center mb-[3vh]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: phase >= 1 ? 0 : -20, opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-[0.8vw] mb-[1vh]">
          <div className="w-[3vw] h-[3vw] rounded-xl bg-blue-600 flex items-center justify-center">
            <span className="text-white font-black text-[1.5vw]">5</span>
          </div>
          <span className="text-[1vw] font-bold text-blue-600 uppercase tracking-[0.15em]">Step Five</span>
        </div>
        <h2 className="text-[3vw] font-black text-slate-900">Review & Confirm</h2>
      </motion.div>

      <motion.div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-[2.5vw] w-[45vw] relative overflow-hidden"
        initial={{ y: 50, opacity: 0 }}
        animate={{
          y: phase >= 2 ? 0 : 50,
          opacity: phase >= 2 ? 1 : 0,
        }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="grid grid-cols-2 gap-[1.5vw] mb-[2.5vh]">
          {summaryItems.map((item, i) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-[0.8vw]"
              initial={{ x: -20, opacity: 0 }}
              animate={{
                x: phase >= 3 ? 0 : -20,
                opacity: phase >= 3 ? 1 : 0,
              }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-[2.5vw] h-[2.5vw] rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <item.icon className="text-blue-600" style={{ width: "1.2vw", height: "1.2vw" }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[0.7vw] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
                <span className="text-[1vw] font-bold text-slate-800">{item.value}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="w-full h-[4vw] bg-blue-600 rounded-2xl flex items-center justify-center relative overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: phase >= 3 ? 0 : 20,
            opacity: phase >= 3 ? 1 : 0,
          }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
        >
          <motion.div
            className="absolute inset-0 bg-emerald-500"
            initial={{ scaleX: 0, transformOrigin: "left" }}
            animate={{ scaleX: phase >= 4 ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.span
            className="relative z-10 text-white font-bold text-[1.2vw] flex items-center gap-[0.5vw]"
            animate={{
              opacity: phase >= 4 ? 0 : 1,
            }}
            transition={{ duration: 0.15 }}
          >
            Book Appointment
          </motion.span>
          <motion.span
            className="absolute z-10 text-white font-bold text-[1.2vw] flex items-center gap-[0.5vw]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: phase >= 4 ? 1 : 0,
              scale: phase >= 4 ? 1 : 0.5,
            }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <CheckCircle2 style={{ width: "1.5vw", height: "1.5vw" }} />
            Booked!
          </motion.span>
        </motion.div>

        {phase >= 4 && (
          <motion.img
            src={checkmarkUrl}
            className="absolute -right-[2vw] -top-[2vw] w-[12vw] h-[12vw] opacity-10 pointer-events-none"
            alt=""
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 12 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
