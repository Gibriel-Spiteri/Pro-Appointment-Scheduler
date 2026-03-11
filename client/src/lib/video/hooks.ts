import { useState, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    startRecording?: () => void;
    stopRecording?: () => void;
  }
}

interface UseVideoPlayerOptions {
  durations: Record<string, number>;
}

export function useVideoPlayer({ durations }: UseVideoPlayerOptions) {
  const sceneKeys = Object.keys(durations);
  const [currentScene, setCurrentScene] = useState(0);
  const hasCompletedFirstPass = useRef(false);
  const hasStartedRecording = useRef(false);

  const advanceScene = useCallback(() => {
    setCurrentScene((prev) => {
      const next = prev + 1;
      if (next >= sceneKeys.length) {
        if (!hasCompletedFirstPass.current) {
          hasCompletedFirstPass.current = true;
          window.stopRecording?.();
        }
        return 0;
      }
      return next;
    });
  }, [sceneKeys.length]);

  useEffect(() => {
    if (!hasStartedRecording.current) {
      hasStartedRecording.current = true;
      window.startRecording?.();
    }
  }, []);

  useEffect(() => {
    const key = sceneKeys[currentScene];
    const duration = durations[key];
    const timer = setTimeout(advanceScene, duration);
    return () => clearTimeout(timer);
  }, [currentScene, advanceScene, durations, sceneKeys]);

  return { currentScene };
}
