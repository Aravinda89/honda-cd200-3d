import * as THREE from "three";

const std = (color: THREE.ColorRepresentation, metalness = 0.2, roughness = 0.5) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness });

// Shared part-material palette, ported from the prototype's `M` object.
export const M = {
  chrome: () => std(0xd4dadd, 0.6, 0.25),
  alloy: () => std(0xb7bec2, 0.4, 0.45),
  steel: () => std(0x7d878d, 0.5, 0.4),
  rubber: () => std(0x1d2226, 0, 0.9),
  lining: () => std(0x6b5a48, 0, 0.9),
  black: () => std(0x22272b, 0.1, 0.6),
};

// Translucent material for parts not modelled yet ("ghost" placeholders).
export const ghost = (color: THREE.ColorRepresentation, opacity = 0.55) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 0.5,
    metalness: 0.2,
    transparent: true,
    opacity,
  });
