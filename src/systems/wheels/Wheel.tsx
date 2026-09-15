import { forwardRef, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { Pickable } from "../../components/Pickable";
import { M, ghost } from "../../lib/materials";
import { useStore } from "../../store";

function Spokes({ id }: { id: string }) {
  const geometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      const side = i % 2 ? 1 : -1;
      const h = a + side * 0.35;
      pts.push(
        new THREE.Vector3(Math.cos(h) * 0.078, Math.sin(h) * 0.078, side * 0.045),
        new THREE.Vector3(Math.cos(a) * 0.21, Math.sin(a) * 0.21, 0)
      );
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  const material = useMemo(() => new THREE.LineBasicMaterial({ color: 0x8d979d }), []);
  const selected = useStore((s) => id !== "ghost" && s.selected === id);
  const setSelected = useStore((s) => s.setSelected);

  useLayoutEffect(() => {
    material.color.setHex(selected ? 0xe0951a : 0x8d979d);
  }, [selected, material]);

  return (
    <lineSegments
      geometry={geometry}
      material={material}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(id);
      }}
    />
  );
}

interface WheelProps {
  x: number;
  /** the front wheel carries real part ids; the rear is all-ghost for now */
  front: boolean;
}

/**
 * One wheel: tyre, rim, hub/drum and spokes in a spinning group (ref
 * forwarded so a driver can rotate it), plus a fixed axle and mudguard.
 */
export const Wheel = forwardRef<THREE.Group, WheelProps>(function Wheel({ x, front }, spinRef) {
  const id = (name: string) => (front ? name : "ghost");

  const tyreGeo = useMemo(() => new THREE.TorusGeometry(0.254, 0.038, 16, 72), []);
  const tyreMat = useMemo(() => M.rubber(), []);
  const rimGeo = useMemo(() => new THREE.TorusGeometry(0.2159, 0.009, 8, 72), []);
  const rimMat = useMemo(() => M.chrome(), []);
  const hubGeo = useMemo(() => new THREE.CylinderGeometry(0.082, 0.082, 0.11, 40), []);
  const hubMat = useMemo(() => M.alloy(), []);
  const axleGeo = useMemo(() => new THREE.CylinderGeometry(0.007, 0.007, 0.24, 12), []);
  const axleMat = useMemo(() => M.steel(), []);
  const guardGeo = useMemo(
    () => new THREE.TorusGeometry(0.31, 0.012, 6, 40, THREE.MathUtils.degToRad(front ? 150 : 170)),
    [front]
  );
  const guardMat = useMemo(() => ghost(0xd4dadd), []);

  return (
    <group position={[x, 0.29, 0]}>
      <group ref={spinRef}>
        <Pickable id={id("wheel_front_tyre")} see={front} geometry={tyreGeo} material={tyreMat} />
        <Pickable id={id("wheel_front_rim")} geometry={rimGeo} material={rimMat} />
        <Pickable
          id={id("brake_front_drum")}
          see={front}
          geometry={hubGeo}
          material={hubMat}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Spokes id={id("wheel_front_spokes")} />
      </group>
      <mesh geometry={axleGeo} material={axleMat} rotation={[Math.PI / 2, 0, 0]} />
      <Pickable
        id="ghost"
        geometry={guardGeo}
        material={guardMat}
        scale={[1, 1, 4]}
        rotation={[0, 0, THREE.MathUtils.degToRad(front ? 15 : 20)]}
      />
    </group>
  );
});
