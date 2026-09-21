import { useVideoConfig } from 'remotion';

export function useVideoData<T>(data: T): T {
  return data;
}

export function useTimeline() {
  const { fps, durationInFrames, width, height } = useVideoConfig();

  return {
    fps,
    durationInFrames,
    width,
    height,
    duration: durationInFrames / fps,
    frameToTime: (frame: number) => frame / fps,
    timeToFrame: (time: number) => Math.round(time * fps),
    progress: (frame: number, start: number, end: number) => {
      const clamped = Math.max(0, Math.min(1, (frame - start) / (end - start)));
      return clamped;
    },
  };
}