import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { CheckCircle2, CalendarDays, Clock, MapPin, User, ArrowRight } from "lucide-react";
import gsap from "gsap";

const checkmarkUrl = `${import.meta.env.BASE_URL}video/checkmark-success.png`;

export function OutroScene() {
  const [phase, setPhase] = useState(0);
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2800),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  useEffect(() => {
    if (!confettiRef.current) return;
    const pieces = confettiRef.current.children;
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    const tl = gsap.timeline({ delay: 0.5 });
    Array.from(pieces).forEach((p, i) => {
      const el = p as HTMLElement;
      el.style.backgroundColor = colors[i % colors.length];
      gsap.set(el, {
        x: 0,
        y: 0,
        opacity: 0,
        scale: 0,
        rotation: Math.random() * 360,
      });
      tl.to(
        el,
        {
          x: (Math.random() - 0.5) * 600,
          y: (Math.random() - 0.5) * 400,
          opacity: 0.6,
          scale: Math.random() * 0.8 + 0.4,
          rotation: Math.random() * 720 - 360,
          duration: 0.8,
          ease: "power2.out",
        },
        i * 0.05
      ).to(
        el,
        {
          opacity: 0,
          y: `+=${100 + Math.random() * 100}`,
          duration: 1.5,
          ease: "power1.in",
        },
        `>-0.2`
      );
    });
    return () => { tl.kill(); };
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ clipPath: "circle(0% at 50% 50%)" }}
      animate={{ clipPath: "circle(100% at 50% 50%)" }}
      exit={{ clipPath: "circle(0% at 50% 50%)" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div ref={confettiRef} className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[0.6vw] h-[0.6vw] rounded-sm"
          />
        ))}
      </div>

      <motion.img
        src={checkmarkUrl}
        className="absolute w-[40vw] h-[40vw] opacity-[0.04] pointer-events-none"
        alt=""
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="w-[8vw] h-[8vw] rounded-full bg-emerald-100 flex items-center justify-center mb-[2vh]"
        initial={{ scale: 0 }}
        animate={{ scale: phase >= 1 ? 1 : 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{
            scale: phase >= 1 ? 1 : 0,
            rotate: phase >= 1 ? 0 : -90,
          }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
        >
          <CheckCircle2 className="text-emerald-500" style={{ width: "4vw", height: "4vw" }} />
        </motion.div>
      </motion.div>

      <motion.h2
        className="text-[3.5vw] font-black text-slate-900 mb-[0.5vh]"
        initial={{ y: 30, opacity: 0 }}
        animate={{
          y: phase >= 2 ? 0 : 30,
          opacity: phase >= 2 ? 1 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        Training Complete!
      </motion.h2>

      <motion.p
        className="text-[1.3vw] text-slate-500 mb-[4vh]"
        initial={{ y: 20, opacity: 0 }}
        animate={{
          y: phase >= 2 ? 0 : 20,
          opacity: phase >= 2 ? 1 : 0,
        }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        You're ready to schedule appointments with confidence
      </motion.p>

      <motion.div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-[2vw] w-[40vw]"
        initial={{ y: 40, opacity: 0 }}
        animate={{
          y: phase >= 3 ? 0 : 40,
          opacity: phase >= 3 ? 1 : 0,
        }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="text-[0.8vw] font-bold text-slate-400 uppercase tracking-[0.15em] mb-[1.5vh] flex items-center gap-[0.5vw]">
          <CalendarDays className="text-blue-500" style={{ width: "1vw", height: "1vw" }} />
          Appointment Summary
        </div>

        <div className="grid grid-cols-2 gap-[1.5vw]">
          {[
            { icon: User, label: "Name", value: "Sarah Johnson" },
            { icon: MapPin, label: "Location", value: "Westside Hub" },
            { icon: CalendarDays, label: "Date", value: "October 15, 2024" },
            { icon: Clock, label: "Time", value: "11:30 AM – 12:30 PM" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="flex items-start gap-[0.6vw]"
              initial={{ x: -20, opacity: 0 }}
              animate={{
                x: phase >= 3 ? 0 : -20,
                opacity: phase >= 3 ? 1 : 0,
              }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <item.icon className="text-slate-400 mt-[0.2vw]" style={{ width: "1.2vw", height: "1.2vw" }} />
              <div className="flex flex-col">
                <span className="text-[0.7vw] text-slate-400 font-semibold">{item.label}</span>
                <span className="text-[1vw] font-bold text-slate-800">{item.value}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="mt-[3vh] flex items-center gap-[0.5vw] text-[1vw] text-blue-600 font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 4 ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <span>Restarting in a moment</span>
        <motion.div
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <ArrowRight style={{ width: "1.2vw", height: "1.2vw" }} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
