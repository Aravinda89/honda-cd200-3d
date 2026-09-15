import { useEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { VIEWS, clamp } from "../data/views";
import { positionFromSpherical, type Spherical } from "../lib/spherical";
import { useStore } from "../store";
import type { ViewKey } from "../types";

interface CameraRigProps {
  controlsRef: RefObject<OrbitControlsImpl | null>;
}

/**
 * Drives the OrbitControls camera for the view-preset chips and the +/-
 * zoom buttons. Day-to-day drag-to-orbit / scroll-to-zoom is handled
 * entirely by OrbitControls itself; this rig only steps in for a few
 * frames after setView()/zoom() to ease the camera to a new pose, then
 * hands control straight back.
 */
export function CameraRig({ controlsRef }: CameraRigProps) {
  const camera = useThree((s) => s.camera);
  const setCameraApi = useStore((s) => s.setCameraApi);

  const cam = useRef<Spherical>({
    target: new THREE.Vector3(...VIEWS.bike.target),
    r: VIEWS.bike.r,
    theta: VIEWS.bike.theta,
    phi: VIEWS.bike.phi,
  });
  const goal = useRef<Spherical>({
    target: cam.current.target.clone(),
    r: cam.current.r,
    theta: cam.current.theta,
    phi: cam.current.phi,
  });
  const active = useRef(false);

  // Read the camera's actual current pose into `cam`, so a new transition
  // starts from wherever the user last left it (after manual dragging).
  const syncFromCamera = () => {
    const target = controlsRef.current?.target ?? cam.current.target;
    const offset = camera.position.clone().sub(target);
    const r = offset.length();
    if (r > 1e-6) {
      cam.current.theta = Math.atan2(offset.x, offset.z);
      cam.current.phi = Math.acos(clamp(offset.y / r, -1, 1));
      cam.current.r = r;
    }
    cam.current.target.copy(target);
  };

  useEffect(() => {
    // establish the initial "whole bike" pose on mount
    positionFromSpherical(camera.position, cam.current);
    controlsRef.current?.target.copy(cam.current.target);
    controlsRef.current?.update();

    setCameraApi({
      setView: (key: ViewKey) => {
        syncFromCamera();
        const v = VIEWS[key];
        const twoPi = Math.PI * 2;
        goal.current.target.set(...v.target);
        goal.current.r = v.r;
        goal.current.theta = v.theta + Math.round((cam.current.theta - v.theta) / twoPi) * twoPi;
        goal.current.phi = v.phi;
        active.current = true;
      },
      zoom: (factor: number) => {
        syncFromCamera();
        goal.current.target.copy(cam.current.target);
        goal.current.theta = cam.current.theta;
        goal.current.phi = cam.current.phi;
        goal.current.r = clamp(cam.current.r * factor, 0.35, 5);
        active.current = true;
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, dt) => {
    if (!active.current) return;
    const controls = controlsRef.current;
    const k = Math.min(1, dt * 6);
    const c = cam.current;
    const g = goal.current;
    c.target.lerp(g.target, k);
    c.r += (g.r - c.r) * k;
    c.theta += (g.theta - c.theta) * k;
    c.phi += (g.phi - c.phi) * k;

    positionFromSpherical(camera.position, c);
    controls?.target.copy(c.target);
    controls?.update();

    const settled =
      c.target.distanceTo(g.target) < 0.001 &&
      Math.abs(c.r - g.r) < 0.001 &&
      Math.abs(c.theta - g.theta) < 0.0005 &&
      Math.abs(c.phi - g.phi) < 0.0005;
    if (settled) active.current = false;
  });

  return null;
}
