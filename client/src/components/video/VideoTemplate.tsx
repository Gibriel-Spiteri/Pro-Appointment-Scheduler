import { AnimatePresence, motion } from "framer-motion";
import { useVideoPlayer } from "@/lib/video/hooks";
import { IntroScene } from "./video_scenes/IntroScene";
import { Step1CustomerInfo } from "./video_scenes/Step1CustomerInfo";
import { Step2PickDate } from "./video_scenes/Step2PickDate";
import { Step3PickLocation } from "./video_scenes/Step3PickLocation";
import { Step4SelectTime } from "./video_scenes/Step4SelectTime";
import { Step5Confirm } from "./video_scenes/Step5Confirm";
import { OutroScene } from "./video_scenes/OutroScene";

const SCENE_DURATIONS = {
  intro: 4000,
  step1: 5000,
  transition1: 2000,
  step2: 4500,
  step3: 4500,
  transition2: 2000,
  step4: 5000,
  step5: 4500,
  outro: 5000,
};

const bgImageUrl = `${import.meta.env.BASE_URL}video/bg-abstract.png`;

const accentPositions = [
  { x: "45vw", y: "40vh", scale: 2.5, opacity: 0.15, rotate: 0 },
  { x: "8vw", y: "15vh", scale: 1, opacity: 0.25, rotate: 45 },
  { x: "50vw", y: "50vh", scale: 0.6, opacity: 0.4, rotate: 90 },
  { x: "75vw", y: "50vh", scale: 1.4, opacity: 0.2, rotate: 135 },
  { x: "20vw", y: "70vh", scale: 0.8, opacity: 0.3, rotate: 180 },
  { x: "60vw", y: "25vh", scale: 0.5, opacity: 0.4, rotate: 225 },
  { x: "15vw", y: "30vh", scale: 1.8, opacity: 0.15, rotate: 270 },
  { x: "80vw", y: "20vh", scale: 1.2, opacity: 0.25, rotate: 315 },
  { x: "40vw", y: "45vh", scale: 2, opacity: 0.1, rotate: 360 },
];

const linePositions = [
  { left: "25%", width: "50%", top: "52%", opacity: 0.6 },
  { left: "5%", width: "90%", top: "12%", opacity: 0.9 },
  { left: "30%", width: "40%", top: "50%", opacity: 0.5 },
  { left: "55%", width: "25%", top: "88%", opacity: 0.7 },
  { left: "35%", width: "60%", top: "30%", opacity: 0.8 },
  { left: "10%", width: "45%", top: "50%", opacity: 0.5 },
  { left: "15%", width: "40%", top: "70%", opacity: 0.6 },
  { left: "5%", width: "80%", top: "15%", opacity: 0.9 },
  { left: "20%", width: "55%", top: "50%", opacity: 0.4 },
];

const squarePositions = [
  { x: "70vw", y: "20vh", rotate: 0, scale: 1 },
  { x: "85vw", y: "60vh", rotate: 45, scale: 1 },
  { x: "10vw", y: "75vh", rotate: 90, scale: 1.5 },
  { x: "10vw", y: "30vh", rotate: 135, scale: 0.8 },
  { x: "50vw", y: "10vh", rotate: 180, scale: 1.2 },
  { x: "80vw", y: "80vh", rotate: 225, scale: 0.7 },
  { x: "30vw", y: "75vh", rotate: 270, scale: 1.1 },
  { x: "65vw", y: "15vh", rotate: 315, scale: 1.3 },
  { x: "45vw", y: "50vh", rotate: 360, scale: 2 },
];

function TransitionBeat({ stepNumber }: { stepNumber: number }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="w-[20vw] h-[20vw] rounded-full bg-blue-600/10 absolute"
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.05, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="flex items-center gap-[2vw]"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
      >
        <motion.div
          className="w-[6vw] h-[6vw] rounded-2xl bg-blue-600 flex items-center justify-center"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-[3vw] font-black text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {stepNumber}
          </span>
        </motion.div>
        <div>
          <motion.div
            className="text-[1.2vw] font-bold text-blue-600 uppercase tracking-[0.2em]"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Next Step
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  const sceneIdx = currentScene;

  return (
    <div
      className="w-full h-full overflow-hidden relative"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImageUrl})` }}
          animate={{
            scale: sceneIdx < 3 ? 1.05 : sceneIdx < 6 ? 1.1 : 1,
            opacity: 0.35,
          }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            background:
              sceneIdx === 0
                ? "radial-gradient(ellipse at 50% 40%, rgba(219,234,254,0.9) 0%, rgba(241,245,249,0.95) 60%, rgba(248,250,252,1) 100%)"
                : sceneIdx >= 7
                  ? "radial-gradient(ellipse at 50% 50%, rgba(220,252,231,0.6) 0%, rgba(241,245,249,0.9) 50%, rgba(248,250,252,1) 100%)"
                  : "radial-gradient(ellipse at 70% 30%, rgba(219,234,254,0.5) 0%, rgba(248,250,252,0.95) 50%, rgba(241,245,249,1) 100%)",
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15), transparent)" }}
        animate={accentPositions[sceneIdx] || accentPositions[0]}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.div
        className="absolute h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
        animate={linePositions[sceneIdx] || linePositions[0]}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />

      <motion.div
        className="absolute w-[5vw] h-[5vw] border-2 border-blue-300/20 rounded-xl"
        animate={squarePositions[sceneIdx] || squarePositions[0]}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.div
        className="absolute w-[3vw] h-[3vw] rounded-full border border-blue-400/15"
        animate={{
          x: ["10vw", "80vw", "50vw", "20vw", "60vw", "40vw", "70vw", "30vw", "10vw"][sceneIdx] || "10vw",
          y: ["80vh", "20vh", "60vh", "40vh", "70vh", "30vh", "50vh", "10vh", "80vh"][sceneIdx] || "80vh",
        }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="absolute inset-0 z-10">
        <AnimatePresence mode="sync">
          {sceneIdx === 0 && <IntroScene key="intro" />}
          {sceneIdx === 1 && <Step1CustomerInfo key="step1" />}
          {sceneIdx === 2 && <TransitionBeat key="t1" stepNumber={2} />}
          {sceneIdx === 3 && <Step2PickDate key="step2" />}
          {sceneIdx === 4 && <Step3PickLocation key="step3" />}
          {sceneIdx === 5 && <TransitionBeat key="t2" stepNumber={4} />}
          {sceneIdx === 6 && <Step4SelectTime key="step4" />}
          {sceneIdx === 7 && <Step5Confirm key="step5" />}
          {sceneIdx === 8 && <OutroScene key="outro" />}
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute top-[3vh] right-[3vw] z-20 flex items-center gap-[0.5vw]"
        animate={{
          opacity: sceneIdx === 0 ? 0 : 0.6,
          y: sceneIdx === 0 ? -20 : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        {Object.keys(SCENE_DURATIONS).map((_, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            animate={{
              width: i === sceneIdx ? "2vw" : "0.5vw",
              height: "0.5vw",
              backgroundColor: i === sceneIdx ? "rgb(37,99,235)" : "rgb(148,163,184)",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
