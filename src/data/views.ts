import type { ViewKey, ViewPreset } from "../types";

export const VIEWS: Record<ViewKey, ViewPreset> = {
  bike: { target: [0, 0.55, 0], r: 2.7, theta: Math.PI * 0.78, phi: 1.2 },
  brake: { target: [0.64, 0.29, 0], r: 0.72, theta: Math.PI * 0.92, phi: 1.38 },
  bar: { target: [0.38, 1.0, 0.2], r: 0.7, theta: Math.PI * 0.35, phi: 0.95 },
  front: { target: [0.3, 0.55, 0], r: 2.3, theta: Math.PI * 0.5, phi: 1.4 },
};

export const VIEW_LABELS: [ViewKey, string][] = [
  ["bike", "Whole bike"],
  ["brake", "Brake side"],
  ["bar", "Handlebar"],
  ["front", "Front"],
];

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function statusText(p: number): string {
  if (p < 0.05) return "Brake released. The return springs hold both shoes clear of the drum, so the wheel turns freely.";
  if (p < 0.3) return "Taking up free play. The cable tightens, but the shoes have not reached the drum yet.";
  if (p < 0.75) return "The cam arm turns the cam. Its flat edges spread the shoes toward the drum.";
  return "Both linings press on the drum. Friction slows the wheel, and the leading shoe does most of the work.";
}
