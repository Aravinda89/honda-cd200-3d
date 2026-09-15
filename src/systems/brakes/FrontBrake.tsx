import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Pickable } from "../../components/Pickable";
import { M } from "../../lib/materials";
import { useStore } from "../../store";

interface FrontBrakeProps {
  /** empty Object3D at the cam arm's cable-end tip, for BrakeCable to track */
  armTipRef: RefObject<THREE.Object3D | null>;
}

/**
 * The front drum brake's internals: backing plate, leading/trailing shoes,
 * cam, anchor pin, return springs and cam arm. This group sits fixed at the
 * front axle and does NOT spin with the wheel — only the shoes/cam/arm/
 * springs move, driven each frame from the store's `pull` value.
 */
export function FrontBrake({ armTipRef }: FrontBrakeProps) {
  const camPivotRef = useRef<THREE.Group>(null);
  const armPivotRef = useRef<THREE.Group>(null);
  const shoeFrontRef = useRef<THREE.Mesh>(null);
  const shoeRearRef = useRef<THREE.Mesh>(null);
  const spring1Ref = useRef<THREE.Mesh>(null);
  const spring2Ref = useRef<THREE.Mesh>(null);

  const plateGeo = useMemo(() => new THREE.CylinderGeometry(0.083, 0.083, 0.012, 40), []);
  const plateMat = useMemo(() => M.alloy(), []);
  const shoeGeo = useMemo(
    () => new THREE.TorusGeometry(0.058, 0.005, 8, 32, THREE.MathUtils.degToRad(140)),
    []
  );
  const shoeFrontMat = useMemo(() => M.lining(), []);
  const shoeRearMat = useMemo(() => M.lining(), []);
  const camGeo = useMemo(() => new THREE.BoxGeometry(0.012, 0.02, 0.03), []);
  const camMat = useMemo(() => M.steel(), []);
  const anchorGeo = useMemo(() => new THREE.CylinderGeometry(0.006, 0.006, 0.034, 12), []);
  const anchorMat = useMemo(() => M.steel(), []);
  const springGeo = useMemo(() => new THREE.CylinderGeometry(0.002, 0.002, 0.074, 8), []);
  const spring1Mat = useMemo(() => M.steel(), []);
  const spring2Mat = useMemo(() => M.steel(), []);
  const armGeo = useMemo(() => new THREE.BoxGeometry(0.07, 0.012, 0.006), []);
  const armMat = useMemo(() => M.steel(), []);

  useFrame(() => {
    const p = useStore.getState().pull;
    if (camPivotRef.current) camPivotRef.current.rotation.z = -p * 0.6;
    if (armPivotRef.current) armPivotRef.current.rotation.z = -0.5 - p * 0.6;
    if (shoeFrontRef.current) shoeFrontRef.current.position.x = p * 0.008;
    if (shoeRearRef.current) shoeRearRef.current.position.x = -p * 0.008;
    const springScale = 1 + p * 0.216;
    if (spring1Ref.current) spring1Ref.current.scale.y = springScale;
    if (spring2Ref.current) spring2Ref.current.scale.y = springScale;
  });

  return (
    <group position={[0.64, 0.29, 0]}>
      <Pickable
        id="brake_front_backing_plate"
        see
        geometry={plateGeo}
        material={plateMat}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.061]}
      />

      <Pickable
        ref={shoeFrontRef}
        id="brake_front_shoe_leading"
        geometry={shoeGeo}
        material={shoeFrontMat}
        rotation={[0, 0, THREE.MathUtils.degToRad(-70)]}
        scale={[1, 1, 3]}
        position={[0, 0, -0.035]}
      />
      <Pickable
        ref={shoeRearRef}
        id="brake_front_shoe_trailing"
        geometry={shoeGeo}
        material={shoeRearMat}
        rotation={[0, 0, THREE.MathUtils.degToRad(110)]}
        scale={[1, 1, 3]}
        position={[0, 0, -0.035]}
      />

      <group ref={camPivotRef} position={[0, 0.058, -0.035]}>
        <Pickable id="brake_front_cam" geometry={camGeo} material={camMat} />
      </group>

      <Pickable
        id="brake_front_anchor_pin"
        geometry={anchorGeo}
        material={anchorMat}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, -0.058, -0.035]}
      />

      <Pickable
        ref={spring1Ref}
        id="brake_front_return_spring"
        geometry={springGeo}
        material={spring1Mat}
        rotation={[0, 0, Math.PI / 2]}
        position={[0, 0.04, -0.03]}
      />
      <Pickable
        ref={spring2Ref}
        id="brake_front_return_spring"
        geometry={springGeo}
        material={spring2Mat}
        rotation={[0, 0, Math.PI / 2]}
        position={[0, -0.04, -0.03]}
      />

      <group ref={armPivotRef} position={[0, 0.058, -0.074]}>
        <Pickable
          id="brake_front_cam_arm"
          geometry={armGeo}
          material={armMat}
          position={[-0.035, 0, 0]}
        />
        <object3D ref={armTipRef} position={[-0.068, 0, 0]} />
      </group>
    </group>
  );
}
