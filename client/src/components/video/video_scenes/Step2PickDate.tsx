import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

export function Step2PickDate() {
  const [phase, setPhase] = useState(0);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 2400),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)" }}
      animate={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
      exit={{ clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex gap-[4vw] items-center">
        <motion.div
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-[2vw] w-[28vw]"
          initial={{ scale: 0.85, opacity: 0, rotateX: -15 }}
          animate={{
            scale: phase >= 1 ? 1 : 0.85,
            opacity: phase >= 1 ? 1 : 0,
            rotateX: phase >= 1 ? 0 : -15,
          }}
          transition={{ duration: 0.7, type: "spring", stiffness: 180, damping: 18 }}
        >
          <div className="flex items-center justify-between mb-[2vh]">
            <div className="flex items-center gap-[0.5vw]">
              <CalendarDays className="text-blue-600" style={{ width: "1.5vw", height: "1.5vw" }} />
              <span className="text-[1.1vw] font-bold text-slate-800">Select Date</span>
            </div>
            <div className="flex gap-[0.3vw]">
              <div className="w-[2vw] h-[2vw] rounded-lg border border-slate-200 flex items-center justify-center">
                <ChevronLeft className="text-slate-400" style={{ width: "1vw", height: "1vw" }} />
              </div>
              <div className="w-[2vw] h-[2vw] rounded-lg border border-slate-200 flex items-center justify-center">
                <ChevronRight className="text-slate-400" style={{ width: "1vw", height: "1vw" }} />
              </div>
            </div>
          </div>

          <motion.div
            className="text-center text-[1vw] font-bold text-slate-700 mb-[1.5vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 2 ? 1 : 0 }}
          >
            October 2024
          </motion.div>

          <div className="grid grid-cols-7 gap-y-[0.4vh]">
            {days.map((d) => (
              <div key={d} className="text-center text-[0.6vw] font-bold text-slate-400 py-[0.5vh]">
                {d}
              </div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => {
              const isSelected = i === 14;
              const isPast = i < 10;
              return (
                <motion.div
                  key={i}
                  className={`h-[2.5vw] flex items-center justify-center text-[0.8vw] font-medium rounded-lg relative ${
                    isPast ? "text-slate-300" : isSelected ? "text-white" : "text-slate-700"
                  }`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: phase >= 2 ? 1 : 0,
                    scale: phase >= 2 ? 1 : 0.5,
                  }}
                  transition={{ delay: i * 0.015, duration: 0.3 }}
                >
                  {isSelected && (
                    <motion.div
                      className="absolute inset-[0.2vw] bg-blue-600 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: phase >= 4 ? 1 : 0 }}
                      transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{i + 1}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: phase >= 3 ? 0 : 50, opacity: phase >= 3 ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-[0.8vw] mb-[1vh]">
            <div className="w-[3vw] h-[3vw] rounded-xl bg-blue-600 flex items-center justify-center">
              <span className="text-white font-black text-[1.5vw]">2</span>
            </div>
            <span className="text-[1vw] font-bold text-blue-600 uppercase tracking-[0.15em]">Step Two</span>
          </div>
          <h2 className="text-[3vw] font-black text-slate-900 leading-tight">
            Select the
            <br />
            Perfect Date
          </h2>
          <p className="text-[1.1vw] text-slate-500 mt-[1vh] max-w-[20vw]">
            Visual calendar widget makes finding availability effortless
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
