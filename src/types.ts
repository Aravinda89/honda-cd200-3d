export interface Part {
  name: string;
  system: string;
  layer: "exterior" | "internal";
  partNumber: string;
  material: string;
  description: string;
  specs: Record<string, number | string | null>;
  faults: string[];
  connectedTo: string[];
}

export type PartsById = Record<string, Part>;

export type ViewKey = "bike" | "brake" | "bar" | "front";

export interface ViewPreset {
  target: [number, number, number];
  r: number;
  theta: number;
  phi: number;
}

export interface CameraApi {
  setView: (key: ViewKey) => void;
  zoom: (factor: number) => void;
}
