import { create } from "zustand";
import type { CameraApi, PartsById, ViewKey } from "./types";

interface AppState {
  // brake lever pull, 0 (released) - 1 (fully applied)
  pull: number;
  playing: boolean;
  spinning: boolean;
  xray: boolean;
  selected: string | null;
  view: ViewKey;
  parts: PartsById;
  // imperative handle into the camera rig living inside <Canvas>, set once
  // CameraRig mounts. Not meant to be subscribed to for rendering.
  cameraApi: CameraApi | null;

  setPull: (p: number) => void;
  setPlaying: (v: boolean) => void;
  togglePlaying: () => void;
  setSpinning: (v: boolean) => void;
  toggleSpinning: () => void;
  setXray: (v: boolean) => void;
  toggleXray: () => void;
  setSelected: (id: string | null) => void;
  setView: (v: ViewKey) => void;
  setParts: (parts: PartsById) => void;
  setCameraApi: (api: CameraApi) => void;
}

export const useStore = create<AppState>((set) => ({
  pull: 0,
  playing: false,
  spinning: true,
  xray: false,
  selected: null,
  view: "bike",
  parts: {},
  cameraApi: null,

  setPull: (p) => set({ pull: p }),
  setPlaying: (v) => set({ playing: v }),
  togglePlaying: () => set((s) => ({ playing: !s.playing })),
  setSpinning: (v) => set({ spinning: v }),
  toggleSpinning: () => set((s) => ({ spinning: !s.spinning })),
  setXray: (v) => set({ xray: v }),
  toggleXray: () => set((s) => ({ xray: !s.xray })),
  setSelected: (id) => set({ selected: id }),
  setView: (v) => set({ view: v }),
  setParts: (parts) => set({ parts }),
  setCameraApi: (api) => set({ cameraApi: api }),
}));
