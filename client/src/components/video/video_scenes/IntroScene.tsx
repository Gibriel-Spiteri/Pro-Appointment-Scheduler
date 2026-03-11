import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import gsap from "gsap";

const dashboardUrl = `${import.meta.env.BASE_URL}video/ui-dashboard.png`;

export function IntroScene() {
  const [phase, setPhase] = useState(0);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1600),
    ];
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  useEffect(() => {
    if (!particlesRef.current) return;
    const particles = particlesRef.current.children;
    const tl = gsap.timeline({ repeat: -1 });
    Array.from(particles).forEach((p, i) => {
      gsap.set(p, {
        x: Math.random() * 800 - 400,
        y: Math.random() * 400 - 200,
        opacity: 0,
        scale: Math.random() * 0.5 + 0.3,
      });
      tl.to(
        p,
        {
          y: `-=${60 + Math.random() * 80}`,
          x: `+=${(Math.random() - 0.5) * 60}`,
          opacity: 0.4,
          duration: 1.5 + Math.random(),
          ease: "power1.out",
        },
        i * 0.3
      ).to(
        p,
        {
          opacity: 0,
          y: `-=${40}`,
          duration: 1,
          ease: "power1.in",
        },
        `>-0.3`
      );
    });
    return () => { tl.kill(); };
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ clipPath: "circle(0% at 50% 50%)" }}
      animate={{ clipPath: "circle(100% at 50% 50%)" }}
      exit={{ clipPath: "circle(0% at 50% 50%)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        src={dashboardUrl}
        className="absolute inset-0 w-full h-full object-cover"
        alt=""
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: phase >= 1 ? 0.08 : 0, scale: 1.05 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      <motion.div
        className="absolute w-[50vw] h-[50vw] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08), transparent)" }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-[0.4vw] h-[0.4vw] rounded-full bg-blue-400/50"
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          className="w-[8vw] h-[8vw] rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-2xl mb-[2vh]"
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: phase >= 1 ? 1 : 0,
            rotate: phase >= 1 ? 0 : -180,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CalendarDays className="text-white" style={{ width: "4vw", height: "4vw" }} />
        </motion.div>

        <motion.h1
          className="text-[4vw] font-black text-slate-900 leading-none tracking-tight"
          initial={{ y: 40, opacity: 0 }}
          animate={{
            y: phase >= 2 ? 0 : 40,
            opacity: phase >= 2 ? 1 : 0,
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          Appointment Scheduler
        </motion.h1>

        <motion.p
          className="text-[1.5vw] text-slate-500 mt-[1vh] font-medium max-w-[40vw]"
          initial={{ y: 20, opacity: 0 }}
          animate={{
            y: phase >= 2 ? 0 : 20,
            opacity: phase >= 2 ? 1 : 0,
          }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          Book appointments for customers at any store location
        </motion.p>

        <motion.span
          className="text-[0.9vw] text-blue-600 font-bold uppercase tracking-[0.2em] mt-[0.5vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 0.7 : 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Employee Training Guide
        </motion.span>

        <motion.div
          className="flex gap-[2vw] mt-[4vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 3 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {[
            { icon: CalendarDays, label: "Schedule" },
            { icon: MapPin, label: "Location" },
            { icon: Clock, label: "Time Slots" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="flex flex-col items-center gap-[0.5vh]"
              initial={{ y: 30, opacity: 0 }}
              animate={{
                y: phase >= 3 ? 0 : 30,
                opacity: phase >= 3 ? 1 : 0,
              }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-[4vw] h-[4vw] rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center">
                <item.icon className="text-blue-600" style={{ width: "2vw", height: "2vw" }} />
              </div>
              <span className="text-[0.9vw] font-semibold text-slate-600">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
