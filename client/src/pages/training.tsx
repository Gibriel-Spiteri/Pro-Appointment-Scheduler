import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import VideoTemplate from "@/components/video/VideoTemplate";

export default function TrainingVideo() {
  const [, navigate] = useLocation();

  return (
    <div className="w-full h-screen bg-slate-950 flex items-center justify-center overflow-hidden relative">
      <button
        data-testid="button-back-to-scheduler"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-50 flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-md px-3 py-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Scheduler
      </button>
      <div className="w-full max-w-[1920px]" style={{ aspectRatio: "16 / 9" }}>
        <VideoTemplate />
      </div>
    </div>
  );
}
