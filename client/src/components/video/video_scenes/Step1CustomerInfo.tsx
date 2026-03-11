import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { User, Mail, Phone, Building2 } from "lucide-react";

export function Step1CustomerInfo() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const fields = [
    { icon: User, label: "Full Name", value: "Sarah Johnson" },
    { icon: Mail, label: "Email", value: "sarah@acme.com" },
    { icon: Phone, label: "Phone", value: "(555) 012-3456" },
    { icon: Building2, label: "Company", value: "Acme Corp" },
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: "inset(0 0% 0 0)" }}
      exit={{ clipPath: "inset(0 0 0 100%)" }}
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
              <span className="text-white font-black text-[1.5vw]">1</span>
            </div>
            <span className="text-[1vw] font-bold text-blue-600 uppercase tracking-[0.15em]">Step One</span>
          </div>
          <h2 className="text-[3vw] font-black text-slate-900 leading-tight">
            Customer
            <br />
            Information
          </h2>
          <p className="text-[1.1vw] text-slate-500 mt-[1vh] max-w-[20vw]">
            Enter the customer's contact details to begin scheduling
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-[2vw] w-[30vw]"
          initial={{ y: 60, opacity: 0, rotateY: -10 }}
          animate={{
            y: phase >= 2 ? 0 : 60,
            opacity: phase >= 2 ? 1 : 0,
            rotateY: phase >= 2 ? 0 : -10,
          }}
          transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 20 }}
        >
          {fields.map((field, i) => (
            <motion.div
              key={field.label}
              className="flex items-center gap-[1vw] py-[1.2vh] border-b border-slate-100 last:border-0"
              initial={{ x: 30, opacity: 0 }}
              animate={{
                x: phase >= 3 ? 0 : 30,
                opacity: phase >= 3 ? 1 : 0,
              }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-[2.5vw] h-[2.5vw] rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <field.icon className="text-blue-600" style={{ width: "1.2vw", height: "1.2vw" }} />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[0.7vw] font-semibold text-slate-400 uppercase tracking-wider">{field.label}</span>
                <motion.span
                  className="text-[1.1vw] font-semibold text-slate-800"
                  initial={{ width: 0 }}
                  animate={{ width: phase >= 4 ? "auto" : 0 }}
                  style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                >
                  {field.value}
                </motion.span>
              </div>
              <motion.div
                className="w-[1vw] h-[1vw] rounded-full bg-emerald-400"
                initial={{ scale: 0 }}
                animate={{ scale: phase >= 4 ? 1 : 0 }}
                transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 400 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
