import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Pickable } from "../../components/Pickable";
import { Tube } from "../../components/Tube";
import { M, ghost } from "../../lib/materials";
import { useStore } from "../../store";

interface BrakeCableProps {
  /** the front brake's cam-arm tip, tracked each frame as the cable's near end */
  armTipRef: RefObject<THREE.Object3D | null>;
}

const BAR_X = 0.36;
const BAR_Y = 1.0;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** The right-hand handlebar lever, its bracket, and the procedural brake
 * cable running from the cam arm up to the lever. */
export function BrakeCable({ armTipRef }: BrakeCableProps) {
  const leverPivotRef = useRef<THREE.Group>(null);
  const cableRef = useRef<THREE.Mesh>(null);
  const lastPull = useRef(-1);

  const barMat = useMemo(() => ghost(0xd4dadd, 0.8), []);
  const gripMat = useMemo(() => ghost(0x22272b, 0.8), []);
  const bracketGeo = useMemo(() => new THREE.BoxGeometry(0.03, 0.03, 0.035), []);
  const bracketMat = useMemo(() => M.alloy(), []);
  const leverGeo = useMemo(() => new THREE.BoxGeometry(0.008, 0.01, 0.13), []);
  const leverMat = useMemo(() => M.chrome(), []);
  const cableMat = useMemo(() => M.black(), []);
  // placeholder geometry; replaced before the first frame is drawn, once
  // armTipRef is mounted (see useFrame below)
  const initialCableGeo = useMemo(() => new THREE.BufferGeometry(), []);

  useFrame(() => {
    const p = useStore.getState().pull;
    if (leverPivotRef.current) leverPivotRef.current.rotation.y = -p * 0.25;

    if (Math.abs(p - lastPull.current) > 0.0005 && cableRef.current && armTipRef.current) {
      const end = new THREE.Vector3();
      armTipRef.current.getWorldPosition(end);
      const curve = new THREE.CatmullRomCurve3([
        end,
        V(0.66, 0.5, -0.14),
        V(0.58, 0.86, -0.14),
        V(0.5, 1.04, 0.08),
        V(0.4, BAR_Y, 0.22),
      ]);
      const geo = new THREE.TubeGeometry(curve, 48, 0.0035, 6);
      cableRef.current.geometry.dispose();
      cableRef.current.geometry = geo;
      lastPull.current = p;
    }
  });

  return (
    <>
      <Tube a={V(BAR_X, BAR_Y, -0.35)} b={V(BAR_X, BAR_Y, 0.35)} radius={0.011} material={barMat} />
      <Tube a={V(BAR_X, BAR_Y, 0.26)} b={V(BAR_X, BAR_Y, 0.35)} radius={0.016} material={gripMat} />
      <Tube a={V(BAR_X, BAR_Y, -0.26)} b={V(BAR_X, BAR_Y, -0.35)} radius={0.016} material={gripMat} />

      <Pickable
        id="brake_front_lever_bracket"
        geometry={bracketGeo}
        material={bracketMat}
        position={[0.39, BAR_Y, 0.22]}
      />
      <group ref={leverPivotRef} position={[0.4, BAR_Y, 0.22]}>
        <Pickable
          id="brake_front_lever"
          geometry={leverGeo}
          material={leverMat}
          position={[0.035, 0, 0.07]}
        />
      </group>

      <Pickable ref={cableRef} id="brake_front_cable" geometry={initialCableGeo} material={cableMat} />
    </>
  );
}
