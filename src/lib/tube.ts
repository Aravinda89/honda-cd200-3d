import * as THREE from "three";

/**
 * Builds a cylinder that spans two points, ported from the prototype's
 * `tube(a, b, r, mat)` helper. Returns the transform to apply to a
 * <cylinderGeometry args={[r, r, length, 12]} /> mesh so it sits between
 * `a` and `b`.
 */
export function tubeTransform(a: THREE.Vector3, b: THREE.Vector3) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const length = dir.length();
  const position = a.clone().addScaledVector(dir, 0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.normalize()
  );
  return { position, quaternion, length };
}
