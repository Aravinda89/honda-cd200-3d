import { useMemo } from "react";
import * as THREE from "three";
import { tubeTransform } from "../lib/tube";
import { Pickable } from "./Pickable";

interface TubeProps {
  a: THREE.Vector3;
  b: THREE.Vector3;
  radius: number;
  material: THREE.MeshStandardMaterial;
  /** defaults to "ghost" — most tubes are not-yet-modelled placeholders */
  id?: string;
}

/** A cylinder mesh spanning two points, ported from the prototype's `tube()` helper. */
export function Tube({ a, b, radius, material, id = "ghost" }: TubeProps) {
  const { position, quaternion, length } = useMemo(() => tubeTransform(a, b), [a, b]);
  const geometry = useMemo(
    () => new THREE.CylinderGeometry(radius, radius, length, 12),
    [radius, length]
  );
  return (
    <Pickable
      id={id}
      geometry={geometry}
      material={material}
      position={position}
      quaternion={quaternion}
    />
  );
}
