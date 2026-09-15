import { useLayoutEffect } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import { useStore } from "../store";

type PickableProps = Omit<ThreeElements["mesh"], "geometry" | "material" | "id"> & {
  /** part id from parts.json, or "ghost" for a not-yet-modelled placeholder */
  id: string;
  /** exterior part that hides internals and should fade + stop being
   * pickable in x-ray mode (front tyre, hub/drum, backing plate) */
  see?: boolean;
  geometry: THREE.BufferGeometry;
  material: THREE.MeshStandardMaterial;
};

/** A clickable, highlightable, x-ray-aware mesh — one part of the bike. */
export function Pickable({ id, see, geometry, material, ref, ...props }: PickableProps) {
  const selected = useStore((s) => id !== "ghost" && s.selected === id);
  const xray = useStore((s) => s.xray);
  const setSelected = useStore((s) => s.setSelected);

  useLayoutEffect(() => {
    material.emissive.setHex(selected ? 0x8a4f00 : 0x000000);
  }, [selected, material]);

  useLayoutEffect(() => {
    if (!see) return;
    material.transparent = xray;
    material.opacity = xray ? 0.12 : 1;
    material.depthWrite = !xray;
    material.needsUpdate = true;
  }, [xray, see, material]);

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={material}
      castShadow
      raycast={xray && see ? () => null : undefined}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(id);
      }}
      {...props}
    />
  );
}
