import VideoTemplate from "@/components/video/VideoTemplate";

export default function TrainingVideo() {
  return (
    <div className="w-full h-screen bg-slate-950 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-[1920px]" style={{ aspectRatio: "16 / 9" }}>
        <VideoTemplate />
      </div>
    </div>
  );
}
