import * as THREE from "three";

export interface Spherical {
  target: THREE.Vector3;
  r: number;
  theta: number;
  phi: number;
}

/** Same spherical-to-cartesian convention as the prototype's camera code:
 * theta rotates around Y (azimuth), phi tilts down from the Y axis (polar). */
export const positionFromSpherical = (out: THREE.Vector3, s: Spherical) =>
  out.set(
    s.target.x + s.r * Math.sin(s.phi) * Math.sin(s.theta),
    s.target.y + s.r * Math.cos(s.phi),
    s.target.z + s.r * Math.sin(s.phi) * Math.cos(s.theta)
  );
