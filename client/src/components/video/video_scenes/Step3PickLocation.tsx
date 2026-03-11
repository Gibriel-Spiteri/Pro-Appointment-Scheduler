import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { MapPin, Check } from "lucide-react";

export function Step3PickLocation() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2500),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const locations = [
    { name: "Downtown Branch", address: "123 Main St", active: false },
    { name: "Westside Hub", address: "456 Park Ave", active: true },
    { name: "North Park", address: "789 Oak Blvd", active: false },
    { name: "East Campus", address: "321 Elm Way", active: false },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ clipPath: "inset(100% 0 0 0)" }}
      animate={{ clipPath: "inset(0% 0 0 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="text-center mb-[4vh]"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: phase >= 1 ? 0 : -30, opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-center gap-[0.8vw] mb-[1vh]">
          <div className="w-[3vw] h-[3vw] rounded-xl bg-blue-600 flex items-center justify-center">
            <span className="text-white font-black text-[1.5vw]">3</span>
          </div>
          <span className="text-[1vw] font-bold text-blue-600 uppercase tracking-[0.15em]">Step Three</span>
        </div>
        <h2 className="text-[3vw] font-black text-slate-900">Choose a Store Location</h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-[1.5vw] w-[50vw]"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 2 ? 1 : 0 }}
      >
        {locations.map((loc, i) => (
          <motion.div
            key={loc.name}
            className={`relative rounded-2xl border-2 p-[1.5vw] flex items-center gap-[1vw] overflow-hidden ${
              loc.active ? "border-emerald-500 bg-white shadow-xl" : "border-slate-200 bg-white/80"
            }`}
            initial={{ y: 40, opacity: 0 }}
            animate={{
              y: phase >= 2 ? 0 : 40,
              opacity: phase >= 2 ? 1 : 0,
            }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {loc.active && (
              <motion.div
                className="absolute inset-0 bg-emerald-50"
                initial={{ scaleX: 0, transformOrigin: "left" }}
                animate={{ scaleX: phase >= 4 ? 1 : 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <div
              className={`relative z-10 w-[3vw] h-[3vw] rounded-xl flex items-center justify-center flex-shrink-0 ${
                loc.active ? "bg-emerald-500" : "bg-slate-100"
              }`}
            >
              {loc.active && phase >= 4 ? (
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Check className="text-white" style={{ width: "1.5vw", height: "1.5vw" }} />
                </motion.div>
              ) : (
                <MapPin
                  className={loc.active ? "text-white" : "text-slate-400"}
                  style={{ width: "1.5vw", height: "1.5vw" }}
                />
              )}
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-[1.1vw] font-bold text-slate-800">{loc.name}</span>
              <span className="text-[0.8vw] text-slate-500">{loc.address}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
