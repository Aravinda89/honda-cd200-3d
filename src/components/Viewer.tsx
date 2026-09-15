import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CameraRig } from "./CameraRig";
import { VIEWS } from "../data/views";
import { positionFromSpherical } from "../lib/spherical";
import { FrontBrake } from "../systems/brakes/FrontBrake";
import { BrakeCable } from "../systems/brakes/BrakeCable";
import { Wheels } from "../systems/wheels/Wheels";
import { GhostBike } from "../systems/placeholder/GhostBike";
import { useStore } from "../store";

const initialCameraPosition = positionFromSpherical(new THREE.Vector3(), {
  target: new THREE.Vector3(...VIEWS.bike.target),
  r: VIEWS.bike.r,
  theta: VIEWS.bike.theta,
  phi: VIEWS.bike.phi,
}).toArray();

/** Advances `pull` through the play-demo curve while `playing` is on. */
function Simulation() {
  const t = useRef(0);
  useFrame((_, dt) => {
    const { playing } = useStore.getState();
    if (!playing) return;
    t.current += dt;
    const pull = (1 - Math.cos(t.current * 1.4)) / 2;
    useStore.setState({ pull });
  });
  return null;
}

function Lighting() {
  return (
    <>
      <hemisphereLight args={[0xffffff, 0x8a979e, 0.9]} />
      <directionalLight
        color={0xffffff}
        intensity={1.1}
        position={[2, 4, -1.5]}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-1.6}
        shadow-camera-right={1.6}
        shadow-camera-top={1.6}
        shadow-camera-bottom={-1.6}
      />
      <directionalLight color={0xffffff} intensity={0.4} position={[-2, 2, 3]} />
    </>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[3, 64]} />
      <meshStandardMaterial color={0xcfd7db} roughness={1} />
    </mesh>
  );
}

export function Viewer() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const armTipRef = useRef<THREE.Object3D>(null);
  const setSelected = useStore((s) => s.setSelected);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true }}
      camera={{ fov: 40, near: 0.02, far: 50, position: initialCameraPosition }}
      // the default Line intersection threshold is huge relative to our
      // part scale, which would let the thin spoke lines swallow clicks
      // meant for whatever is behind them
      raycaster={{
        params: { Mesh: {}, Line: { threshold: 0.004 }, LOD: {}, Points: { threshold: 1 }, Sprite: {} },
      }}
      onPointerMissed={() => setSelected(null)}
    >
      <color attach="background" args={[0xdfe5e8]} />
      <Lighting />
      <Ground />
      <Wheels />
      <FrontBrake armTipRef={armTipRef} />
      <BrakeCable armTipRef={armTipRef} />
      <GhostBike />
      <Simulation />
      <CameraRig controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={VIEWS.bike.target}
        enableDamping
        dampingFactor={0.1}
        enablePan={false}
        minDistance={0.35}
        maxDistance={5}
        minPolarAngle={0.25}
        maxPolarAngle={1.52}
      />
    </Canvas>
  );
}
