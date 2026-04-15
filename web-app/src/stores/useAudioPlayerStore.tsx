import { create } from "zustand";

interface AudioPlayerTrack {
  id: string | null;
  title: string | null;
  audioUrl: string | null;
  thumbnailUrl?: string | null;
  generatedBy: string | null;
}

interface AudioPlayerState {
  track: AudioPlayerTrack | null;
  setTrack: (newTrack: AudioPlayerTrack) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isDismissed: boolean;
  setIsDismissed: (dismissed: boolean) => void;
}

const useAudioPlayerStore = create<AudioPlayerState>((set) => ({
  track: null,
  setTrack: (newTrack) => set({ track: newTrack }),
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  isDismissed: false,
  setIsDismissed: (dismissed) => set({ isDismissed: dismissed }),
}));

export default useAudioPlayerStore;
