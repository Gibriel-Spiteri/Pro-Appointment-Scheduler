import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function Step4SelectTime() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const slots = [
    { time: "9:00 AM", state: "past" },
    { time: "9:30 AM", state: "past" },
    { time: "10:00 AM", state: "booked" },
    { time: "10:30 AM", state: "booked" },
    { time: "11:00 AM", state: "available" },
    { time: "11:30 AM", state: "selected" },
    { time: "12:00 PM", state: "overlap" },
    { time: "12:30 PM", state: "available" },
  ];

  function slotStyle(state: string) {
    switch (state) {
      case "past":
        return "bg-slate-100 text-slate-400 border-slate-200";
      case "booked":
        return "bg-red-50 text-red-400 border-red-200 line-through";
      case "selected":
        return "bg-emerald-500 text-white border-emerald-500 font-bold";
      case "overlap":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-white text-slate-700 border-slate-200";
    }
  }

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ clipPath: "inset(0 0 0 100%)" }}
      animate={{ clipPath: "inset(0 0 0 0%)" }}
      exit={{ clipPath: "inset(0 100% 0 0)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex gap-[4vw] items-center">
        <motion.div
          className="flex flex-col"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: phase >= 1 ? 0 : -50, opacity: phase >= 1 ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-[0.8vw] mb-[1vh]">
            <div className="w-[3vw] h-[3vw] rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-white font-black text-[1.5vw]">4</span>
            </div>
            <span className="text-[1vw] font-bold text-blue-600 uppercase tracking-[0.15em]">Step Four</span>
          </div>
          <h2 className="text-[3vw] font-black text-slate-900 leading-tight">
            Lock in the
            <br />
            Time Slot
          </h2>
          <p className="text-[1.1vw] text-slate-500 mt-[1vh] max-w-[20vw]">
            Clear indicators for available, booked, and past slots
          </p>

          <motion.div
            className="mt-[3vh] space-y-[0.8vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 3 ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            {[
              { color: "bg-slate-300", label: "Past" },
              { color: "bg-red-400", label: "Booked" },
              { color: "bg-emerald-500", label: "Selected" },
              { color: "bg-white border border-slate-300", label: "Available" },
            ].map((legend) => (
              <div key={legend.label} className="flex items-center gap-[0.5vw]">
                <div className={`w-[0.8vw] h-[0.8vw] rounded-sm ${legend.color}`} />
                <span className="text-[0.75vw] text-slate-500 font-medium">{legend.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-[2vw] w-[28vw]"
          initial={{ y: 60, opacity: 0, rotateY: -10 }}
          animate={{
            y: phase >= 2 ? 0 : 60,
            opacity: phase >= 2 ? 1 : 0,
            rotateY: phase >= 2 ? 0 : -10,
          }}
          transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="flex items-center gap-[0.5vw] mb-[2vh]">
            <Clock className="text-blue-600" style={{ width: "1.5vw", height: "1.5vw" }} />
            <span className="text-[1.1vw] font-bold text-slate-800">Time Slots</span>
          </div>

          <div className="grid grid-cols-2 gap-[0.8vw]">
            {slots.map((slot, i) => (
              <motion.div
                key={slot.time}
                className={`h-[3.5vw] rounded-xl border flex items-center justify-center text-[0.9vw] relative overflow-hidden ${slotStyle(slot.state)}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{
                  opacity: phase >= 2 ? 1 : 0,
                  scale: phase >= 2 ? 1 : 0.7,
                }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {slot.state === "selected" && (
                  <motion.div
                    className="absolute inset-0 bg-emerald-500"
                    initial={{ scaleY: 0, transformOrigin: "bottom" }}
                    animate={{ scaleY: phase >= 4 ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                {slot.state === "booked" && (
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, transparent, transparent 4px, #ef4444 4px, #ef4444 8px)",
                    }}
                  />
                )}
                <span className="relative z-10">{slot.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
