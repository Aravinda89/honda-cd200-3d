import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Wheel } from "./Wheel";
import { useStore } from "../../store";

/** Front + rear wheels, sharing one spin speed that slows as the (front)
 * brake bites and recovers toward a cruising speed when "Wheel turning" is on. */
export function Wheels() {
  const frontSpinRef = useRef<THREE.Group>(null);
  const rearSpinRef = useRef<THREE.Group>(null);
  const wheelSpeed = useRef(3);

  useFrame((_, dt) => {
    const { pull, spinning } = useStore.getState();
    const target = spinning ? 3 : 0;
    if (pull < 0.35) {
      wheelSpeed.current += (target - wheelSpeed.current) * Math.min(1, dt * 0.8);
    } else {
      wheelSpeed.current = Math.max(0, wheelSpeed.current - (pull - 0.35) * 9 * dt);
    }
    if (frontSpinRef.current) frontSpinRef.current.rotation.z -= wheelSpeed.current * dt;
    if (rearSpinRef.current) rearSpinRef.current.rotation.z -= wheelSpeed.current * dt;
  });

  return (
    <>
      <Wheel x={0.64} front ref={frontSpinRef} />
      <Wheel x={-0.64} front={false} ref={rearSpinRef} />
    </>
  );
}
