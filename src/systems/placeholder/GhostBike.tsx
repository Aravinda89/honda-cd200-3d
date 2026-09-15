import { useMemo } from "react";
import * as THREE from "three";
import { Pickable } from "../../components/Pickable";
import { Tube } from "../../components/Tube";
import { ghost } from "../../lib/materials";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/**
 * Everything on the bike that isn't modelled yet: fork legs, rear shocks,
 * swingarm, frame rails/backbone, headlamp, engine block, fuel tank, seat.
 * All faded placeholders for scale only — clicking any of them selects
 * "ghost", which the info panel shows as "Not modelled yet".
 */
export function GhostBike() {
  const forkLowerMat = useMemo(() => ghost(0xd4dadd, 0.7), []);
  const forkUpperMat = useMemo(() => ghost(0x1c7db1, 0.7), []);
  const swingarmMat = useMemo(() => ghost(0x444b50), []);
  const shockMat = useMemo(() => ghost(0x1c7db1), []);
  const mountMat = useMemo(() => ghost(0xd4dadd), []);
  const railMat = useMemo(() => ghost(0xd4dadd), []);
  const frameMat = useMemo(() => ghost(0x444b50), []);
  const lampMat = useMemo(() => ghost(0xd4dadd, 0.75), []);
  const bodyMat = useMemo(() => ghost(0xb7bec2), []);
  const tankMat = useMemo(() => ghost(0x1c7db1, 0.7), []);
  const seatMat = useMemo(() => ghost(0x22272b, 0.7), []);

  const lampGeo = useMemo(() => new THREE.CylinderGeometry(0.085, 0.07, 0.1, 32), []);
  const engineGeo = useMemo(() => new THREE.BoxGeometry(0.34, 0.26, 0.26), []);
  const barrelsGeo = useMemo(() => new THREE.BoxGeometry(0.15, 0.2, 0.24), []);
  const tankGeo = useMemo(() => new THREE.SphereGeometry(1, 32, 16), []);
  const seatGeo = useMemo(() => new THREE.BoxGeometry(0.55, 0.07, 0.24), []);

  return (
    <>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Tube a={V(0.64, 0.29, s * 0.1)} b={V(0.505, 0.6, s * 0.1)} radius={0.019} material={forkLowerMat} />
          <Tube a={V(0.505, 0.6, s * 0.1)} b={V(0.4, 0.84, s * 0.1)} radius={0.024} material={forkUpperMat} />
          <Tube a={V(-0.64, 0.29, s * 0.1)} b={V(-0.12, 0.36, s * 0.1)} radius={0.016} material={swingarmMat} />
          <Tube a={V(-0.6, 0.35, s * 0.11)} b={V(-0.55, 0.74, s * 0.11)} radius={0.022} material={shockMat} />
          <Tube a={V(0.24, 0.5, s * 0.12)} b={V(0.18, 0.24, s * 0.14)} radius={0.02} material={mountMat} />
          <Tube a={V(0.18, 0.24, s * 0.14)} b={V(-0.82, 0.3, s * 0.17)} radius={0.026} material={railMat} />
        </group>
      ))}

      <Tube a={V(0.37, 0.86, 0)} b={V(-0.1, 0.8, 0)} radius={0.02} material={frameMat} />
      <Tube a={V(-0.1, 0.8, 0)} b={V(-0.62, 0.78, 0)} radius={0.02} material={frameMat} />
      <Tube a={V(0.37, 0.84, 0)} b={V(0.22, 0.36, 0)} radius={0.02} material={frameMat} />
      <Tube a={V(-0.25, 0.78, 0)} b={V(-0.12, 0.3, 0)} radius={0.02} material={frameMat} />

      <Pickable
        id="ghost"
        geometry={lampGeo}
        material={lampMat}
        rotation={[0, 0, Math.PI / 2]}
        position={[0.5, 0.9, 0]}
      />
      <Pickable id="ghost" geometry={engineGeo} material={bodyMat} position={[0.04, 0.4, 0]} />
      <Pickable
        id="ghost"
        geometry={barrelsGeo}
        material={bodyMat}
        position={[0.16, 0.6, 0]}
        rotation={[0, 0, -0.17]}
      />
      <Pickable
        id="ghost"
        geometry={tankGeo}
        material={tankMat}
        scale={[0.26, 0.1, 0.14]}
        position={[0.12, 0.88, 0]}
      />
      <Pickable id="ghost" geometry={seatGeo} material={seatMat} position={[-0.33, 0.84, 0]} />
    </>
  );
}
