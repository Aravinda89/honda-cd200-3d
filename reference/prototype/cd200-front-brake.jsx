import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const PARTS = {
  brake_front_lever: {
    name: "Front brake lever", system: "Brakes", layer: "exterior",
    description: "Right-hand handlebar lever. Squeezing it pulls the inner cable, which turns the cam arm at the front hub.",
    faults: ["Too much free play: cable stretched or shoes worn", "Stiff or slow return: dry cable or dry pivot bolt"],
    connectedTo: ["brake_front_lever_bracket", "brake_front_cable"],
  },
  brake_front_lever_bracket: {
    name: "Lever bracket", system: "Brakes", layer: "exterior",
    description: "Clamps to the handlebar and holds the lever pivot, the cable end and the cable adjuster.",
    faults: ["Loose clamp lets the lever rotate on the bar"],
    connectedTo: ["brake_front_lever", "brake_front_cable"],
  },
  brake_front_cable: {
    name: "Front brake cable", system: "Brakes", layer: "exterior",
    description: "Carries the pull from the lever down to the cam arm. The adjuster at the hub end sets lever free play.",
    faults: ["Frayed strands: replace immediately", "Rough action: lubricate or replace", "Stretched: free play keeps growing"],
    connectedTo: ["brake_front_lever", "brake_front_cam_arm"],
  },
  brake_front_cam_arm: {
    name: "Cam arm", system: "Brakes", layer: "exterior",
    description: "Lever outside the backing plate, splined to the cam. The cable pulls it and turns the cam inside the drum.",
    faults: ["Arm past 90 degrees to the cable at full pull: shoes worn, leverage lost"],
    connectedTo: ["brake_front_cable", "brake_front_cam", "brake_front_backing_plate"],
  },
  brake_front_cam: {
    name: "Brake cam", system: "Brakes", layer: "internal",
    description: "Flat-sided shaft through the backing plate. As it turns, its edges push the shoe ends apart.",
    faults: ["Dry or corroded cam sticks, so the brake drags or releases slowly"],
    connectedTo: ["brake_front_cam_arm", "brake_front_shoe_leading", "brake_front_shoe_trailing"],
  },
  brake_front_shoe_leading: {
    name: "Leading shoe", system: "Brakes", layer: "internal",
    description: "Front shoe. The turning drum drags it harder into contact, so it does most of the braking.",
    faults: ["Worn lining: weak brake, long lever travel", "Oil or grease on lining: replace shoes", "Glazed lining: poor bite after overheating"],
    connectedTo: ["brake_front_cam", "brake_front_anchor_pin", "brake_front_return_spring", "brake_front_drum"],
  },
  brake_front_shoe_trailing: {
    name: "Trailing shoe", system: "Brakes", layer: "internal",
    description: "Rear shoe. The drum pushes it away slightly, so it brakes less. One leading shoe gives the design its name: SLS.",
    faults: ["Worn or contaminated lining, as for the leading shoe"],
    connectedTo: ["brake_front_cam", "brake_front_anchor_pin", "brake_front_return_spring", "brake_front_drum"],
  },
  brake_front_return_spring: {
    name: "Return springs", system: "Brakes", layer: "internal",
    description: "Pull both shoes back together and clear of the drum when the lever is released.",
    faults: ["Weak springs: brake drags and the hub runs hot"],
    connectedTo: ["brake_front_shoe_leading", "brake_front_shoe_trailing"],
  },
  brake_front_anchor_pin: {
    name: "Anchor pin", system: "Brakes", layer: "internal",
    description: "Fixed pin opposite the cam. The shoes pivot on it, and it passes the braking force into the backing plate.",
    faults: ["Worn pin lets the shoes shift, causing uneven wear"],
    connectedTo: ["brake_front_backing_plate", "brake_front_shoe_leading", "brake_front_shoe_trailing"],
  },
  brake_front_backing_plate: {
    name: "Backing plate", system: "Brakes", layer: "exterior",
    description: "Holds the cam, anchor pin and shoes. It locks to the fork leg so it cannot turn with the wheel.",
    faults: ["Damaged locating slot or stop: plate can shift under braking"],
    connectedTo: ["brake_front_cam", "brake_front_anchor_pin", "brake_front_cam_arm", "brake_front_drum"],
  },
  brake_front_drum: {
    name: "Hub and brake drum", system: "Brakes", layer: "exterior",
    description: "The hub turns with the wheel. Its inner surface is the drum the shoes press against. Inner diameter 140 mm.",
    faults: ["Scored surface: grinding noise, fast shoe wear", "Out of round: pulsing lever or judder"],
    connectedTo: ["brake_front_shoe_leading", "brake_front_shoe_trailing", "wheel_front_spokes"],
  },
  wheel_front_tyre: {
    name: "Front tyre", system: "Wheels", layer: "exterior",
    description: "3.00 x 17 tyre, about 585 mm across. Measure yours to confirm.",
    faults: ["Low pressure or worn tread affects braking grip"],
    connectedTo: ["wheel_front_rim"],
  },
  wheel_front_rim: {
    name: "Front rim", system: "Wheels", layer: "exterior",
    description: "17-inch steel rim, laced to the hub with spokes.",
    faults: ["Dents or runout cause wobble under braking"],
    connectedTo: ["wheel_front_tyre", "wheel_front_spokes"],
  },
  wheel_front_spokes: {
    name: "Spokes", system: "Wheels", layer: "exterior",
    description: "Wire spokes carry load between rim and hub, including braking torque. 36 shown; count yours to confirm.",
    faults: ["Loose spokes: dull sound when tapped, wheel goes out of true"],
    connectedTo: ["wheel_front_rim", "brake_front_drum"],
  },
};

const VIEWS = {
  bike: { target: [0, 0.55, 0], r: 2.7, theta: Math.PI * 0.78, phi: 1.2 },
  brake: { target: [0.64, 0.29, 0], r: 0.72, theta: Math.PI * 0.92, phi: 1.38 },
  bar: { target: [0.38, 1.0, 0.2], r: 0.7, theta: Math.PI * 0.35, phi: 0.95 },
  front: { target: [0.3, 0.55, 0], r: 2.3, theta: Math.PI * 0.5, phi: 1.4 },
};
const VIEW_LABELS = [["bike", "Whole bike"], ["brake", "Brake side"], ["bar", "Handlebar"], ["front", "Front"]];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function statusText(p) {
  if (p < 0.05) return "Brake released. The return springs hold both shoes clear of the drum, so the wheel turns freely.";
  if (p < 0.3) return "Taking up free play. The cable tightens, but the shoes have not reached the drum yet.";
  if (p < 0.75) return "The cam arm turns the cam. Its flat edges spread the shoes toward the drum.";
  return "Both linings press on the drum. Friction slows the wheel, and the leading shoe does most of the work.";
}

export default function BrakeViewer() {
  const mountRef = useRef(null);
  const apiRef = useRef({});
  const sim = useRef({ pull: 0, playing: false, spinning: true });
  const sliderRef = useRef(null);
  const readoutRef = useRef(null);
  const statusRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [spinning, setSpinning] = useState(true);
  const [xray, setXray] = useState(false);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("bike");

  const syncUI = (p) => {
    if (sliderRef.current) sliderRef.current.value = p;
    if (readoutRef.current) readoutRef.current.textContent = `${Math.round(p * 100)}%`;
    if (statusRef.current) statusRef.current.textContent = statusText(p);
  };

  useEffect(() => { sim.current.playing = playing; }, [playing]);
  useEffect(() => { sim.current.spinning = spinning; }, [spinning]);
  useEffect(() => { apiRef.current.setXray?.(xray); }, [xray]);
  useEffect(() => { apiRef.current.highlight?.(selected); }, [selected]);
  useEffect(() => { apiRef.current.setView?.(view); }, [view]);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdfe5e8);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.02, 50);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a979e, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(2, 4, -1.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -1.6, right: 1.6, top: 1.6, bottom: -1.6 });
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-2, 2, 3);
    scene.add(fill);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(3, 64), new THREE.MeshStandardMaterial({ color: 0xcfd7db, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const std = (color, metalness = 0.2, roughness = 0.5) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
    const M = {
      chrome: () => std(0xd4dadd, 0.6, 0.25),
      alloy: () => std(0xb7bec2, 0.4, 0.45),
      steel: () => std(0x7d878d, 0.5, 0.4),
      rubber: () => std(0x1d2226, 0, 0.9),
      lining: () => std(0x6b5a48, 0, 0.9),
      black: () => std(0x22272b, 0.1, 0.6),
    };
    const ghost = (color, opacity = 0.55) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.2, transparent: true, opacity });

    const pickables = [];
    const tag = (obj, id) => {
      obj.userData.partId = id;
      obj.castShadow = true;
      if (obj.material.color) obj.userData.baseColor = obj.material.color.getHex();
      pickables.push(obj);
      return obj;
    };
    const tube = (a, b, r, mat) => {
      const dir = new THREE.Vector3().subVectors(b, a);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 12), mat);
      m.position.copy(a).addScaledVector(dir, 0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      return m;
    };
    const V = (x, y, z) => new THREE.Vector3(x, y, z);

    function buildWheel(x, front) {
      const holder = new THREE.Group();
      holder.position.set(x, 0.29, 0);
      const spin = new THREE.Group();
      holder.add(spin);
      const id = (name) => (front ? name : "ghost");
      const tyre = tag(new THREE.Mesh(new THREE.TorusGeometry(0.254, 0.038, 16, 72), M.rubber()), id("wheel_front_tyre"));
      const rim = tag(new THREE.Mesh(new THREE.TorusGeometry(0.2159, 0.009, 8, 72), M.chrome()), id("wheel_front_rim"));
      const hub = tag(new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.11, 40), M.alloy()), id("brake_front_drum"));
      hub.rotation.x = Math.PI / 2;
      if (front) { tyre.userData.see = true; hub.userData.see = true; }
      const pts = [];
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const side = i % 2 ? 1 : -1;
        const h = a + side * 0.35;
        pts.push(V(Math.cos(h) * 0.078, Math.sin(h) * 0.078, side * 0.045), V(Math.cos(a) * 0.21, Math.sin(a) * 0.21, 0));
      }
      const spokes = tag(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x8d979d })), id("wheel_front_spokes"));
      spin.add(tyre, rim, hub, spokes);
      const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.24, 12), M.steel());
      axle.rotation.x = Math.PI / 2;
      holder.add(axle);
      const guard = tag(new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.012, 6, 40, THREE.MathUtils.degToRad(front ? 150 : 170)), ghost(0xd4dadd)), "ghost");
      guard.scale.z = 4;
      guard.rotation.z = THREE.MathUtils.degToRad(front ? 15 : 20);
      holder.add(guard);
      scene.add(holder);
      return spin;
    }
    const frontSpin = buildWheel(0.64, true);
    const rearSpin = buildWheel(-0.64, false);

    const brake = new THREE.Group();
    brake.position.set(0.64, 0.29, 0);
    scene.add(brake);
    const plate = tag(new THREE.Mesh(new THREE.CylinderGeometry(0.083, 0.083, 0.012, 40), M.alloy()), "brake_front_backing_plate");
    plate.rotation.x = Math.PI / 2;
    plate.position.z = -0.061;
    plate.userData.see = true;
    brake.add(plate);

    const shoeGeo = new THREE.TorusGeometry(0.058, 0.005, 8, 32, THREE.MathUtils.degToRad(140));
    const shoeFront = tag(new THREE.Mesh(shoeGeo, M.lining()), "brake_front_shoe_leading");
    shoeFront.rotation.z = THREE.MathUtils.degToRad(-70);
    shoeFront.scale.z = 3;
    shoeFront.position.z = -0.035;
    const shoeRear = tag(new THREE.Mesh(shoeGeo, M.lining()), "brake_front_shoe_trailing");
    shoeRear.rotation.z = THREE.MathUtils.degToRad(110);
    shoeRear.scale.z = 3;
    shoeRear.position.z = -0.035;
    brake.add(shoeFront, shoeRear);

    const camPivot = new THREE.Group();
    camPivot.position.set(0, 0.058, -0.035);
    camPivot.add(tag(new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.02, 0.03), M.steel()), "brake_front_cam"));
    brake.add(camPivot);

    const anchor = tag(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.034, 12), M.steel()), "brake_front_anchor_pin");
    anchor.rotation.x = Math.PI / 2;
    anchor.position.set(0, -0.058, -0.035);
    brake.add(anchor);

    const springs = [0.04, -0.04].map((y) => {
      const s = tag(new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.074, 8), M.steel()), "brake_front_return_spring");
      s.rotation.z = Math.PI / 2;
      s.position.set(0, y, -0.03);
      brake.add(s);
      return s;
    });

    const armPivot = new THREE.Group();
    armPivot.position.set(0, 0.058, -0.074);
    const arm = tag(new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.006), M.steel()), "brake_front_cam_arm");
    arm.position.x = -0.035;
    const armTip = new THREE.Object3D();
    armTip.position.x = -0.068;
    armPivot.add(arm, armTip);
    brake.add(armPivot);

    const barX = 0.36, barY = 1.0;
    scene.add(tag(tube(V(barX, barY, -0.35), V(barX, barY, 0.35), 0.011, ghost(0xd4dadd, 0.8)), "ghost"));
    [-1, 1].forEach((s) => scene.add(tag(tube(V(barX, barY, s * 0.26), V(barX, barY, s * 0.35), 0.016, ghost(0x22272b, 0.8)), "ghost")));
    const bracket = tag(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.035), M.alloy()), "brake_front_lever_bracket");
    bracket.position.set(0.39, barY, 0.22);
    scene.add(bracket);
    const leverPivot = new THREE.Group();
    leverPivot.position.set(0.4, barY, 0.22);
    const lever = tag(new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.01, 0.13), M.chrome()), "brake_front_lever");
    lever.position.set(0.035, 0, 0.07);
    leverPivot.add(lever);
    scene.add(leverPivot);

    const cableMat = M.black();
    let cable = null;
    const buildCable = () => {
      const end = new THREE.Vector3();
      armTip.getWorldPosition(end);
      const curve = new THREE.CatmullRomCurve3([end, V(0.66, 0.5, -0.14), V(0.58, 0.86, -0.14), V(0.5, 1.04, 0.08), V(0.4, barY, 0.22)]);
      const geo = new THREE.TubeGeometry(curve, 48, 0.0035, 6);
      if (cable) { cable.geometry.dispose(); cable.geometry = geo; }
      else { cable = tag(new THREE.Mesh(geo, cableMat), "brake_front_cable"); scene.add(cable); }
    };

    [-1, 1].forEach((s) => {
      scene.add(tag(tube(V(0.64, 0.29, s * 0.1), V(0.505, 0.6, s * 0.1), 0.019, ghost(0xd4dadd, 0.7)), "ghost"));
      scene.add(tag(tube(V(0.505, 0.6, s * 0.1), V(0.4, 0.84, s * 0.1), 0.024, ghost(0x1c7db1, 0.7)), "ghost"));
      scene.add(tag(tube(V(-0.64, 0.29, s * 0.1), V(-0.12, 0.36, s * 0.1), 0.016, ghost(0x444b50)), "ghost"));
      scene.add(tag(tube(V(-0.6, 0.35, s * 0.11), V(-0.55, 0.74, s * 0.11), 0.022, ghost(0x1c7db1)), "ghost"));
      scene.add(tag(tube(V(0.24, 0.5, s * 0.12), V(0.18, 0.24, s * 0.14), 0.02, ghost(0xd4dadd)), "ghost"));
      scene.add(tag(tube(V(0.18, 0.24, s * 0.14), V(-0.82, 0.3, s * 0.17), 0.026, ghost(0xd4dadd)), "ghost"));
    });
    const frameMat = ghost(0x444b50);
    [[V(0.37, 0.86, 0), V(-0.1, 0.8, 0)], [V(-0.1, 0.8, 0), V(-0.62, 0.78, 0)], [V(0.37, 0.84, 0), V(0.22, 0.36, 0)], [V(-0.25, 0.78, 0), V(-0.12, 0.3, 0)]]
      .forEach(([a, b]) => scene.add(tag(tube(a, b, 0.02, frameMat), "ghost")));
    const lamp = tag(new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.07, 0.1, 32), ghost(0xd4dadd, 0.75)), "ghost");
    lamp.rotation.z = Math.PI / 2;
    lamp.position.set(0.5, 0.9, 0);
    const engine = tag(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.26), ghost(0xb7bec2)), "ghost");
    engine.position.set(0.04, 0.4, 0);
    const barrels = tag(new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.24), ghost(0xb7bec2)), "ghost");
    barrels.position.set(0.16, 0.6, 0);
    barrels.rotation.z = -0.17;
    const tank = tag(new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), ghost(0x1c7db1, 0.7)), "ghost");
    tank.scale.set(0.26, 0.1, 0.14);
    tank.position.set(0.12, 0.88, 0);
    const seat = tag(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.07, 0.24), ghost(0x22272b, 0.7)), "ghost");
    seat.position.set(-0.33, 0.84, 0);
    scene.add(lamp, engine, barrels, tank, seat);

    const cam = { target: V(...VIEWS.bike.target), r: 2.7, theta: VIEWS.bike.theta, phi: VIEWS.bike.phi };
    const goal = { target: cam.target.clone(), r: cam.r, theta: cam.theta, phi: cam.phi };
    let xrayOn = false;

    apiRef.current.setView = (key) => {
      const v = VIEWS[key];
      goal.target.set(...v.target);
      goal.r = v.r;
      const twoPi = Math.PI * 2;
      goal.theta = v.theta + Math.round((cam.theta - v.theta) / twoPi) * twoPi;
      goal.phi = v.phi;
    };
    apiRef.current.zoom = (f) => { goal.r = clamp(goal.r * f, 0.35, 5); };
    apiRef.current.highlight = (id) => {
      pickables.forEach((o) => {
        const on = id && id !== "ghost" && o.userData.partId === id;
        if (o.material.emissive) o.material.emissive.setHex(on ? 0x8a4f00 : 0x000000);
        else o.material.color.setHex(on ? 0xe0951a : o.userData.baseColor);
      });
    };
    apiRef.current.setXray = (on) => {
      xrayOn = on;
      pickables.forEach((o) => {
        if (!o.userData.see) return;
        o.material.transparent = on;
        o.material.opacity = on ? 0.12 : 1;
        o.material.depthWrite = !on;
        o.material.needsUpdate = true;
      });
    };

    const ray = new THREE.Raycaster();
    ray.params.Line.threshold = 0.004;
    const el = renderer.domElement;
    const pick = (x, y) => {
      const rect = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickables, false).find((h) => !(xrayOn && h.object.userData.see));
      setSelected(hit ? hit.object.userData.partId : null);
    };
    let down = null;
    const onDown = (e) => { down = { x: e.clientX, y: e.clientY, moved: 0 }; el.setPointerCapture(e.pointerId); };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - down.x, dy = e.clientY - down.y;
      down.moved += Math.abs(dx) + Math.abs(dy);
      down.x = e.clientX; down.y = e.clientY;
      goal.theta -= dx * 0.008;
      goal.phi = clamp(goal.phi - dy * 0.006, 0.25, 1.52);
    };
    const onUp = (e) => { if (down && down.moved < 6) pick(e.clientX, e.clientY); down = null; };
    const onWheel = (e) => { e.preventDefault(); goal.r = clamp(goal.r * (1 + e.deltaY * 0.001), 0.35, 5); };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    let last = performance.now(), t = 0, wheelSpeed = 3, lastPull = -1, raf;
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      if (s.playing) {
        t += dt;
        s.pull = (1 - Math.cos(t * 1.4)) / 2;
        syncUI(s.pull);
      }
      const p = s.pull;
      camPivot.rotation.z = -p * 0.6;
      armPivot.rotation.z = -0.5 - p * 0.6;
      shoeFront.position.x = p * 0.008;
      shoeRear.position.x = -p * 0.008;
      springs.forEach((sp) => { sp.scale.y = 1 + p * 0.216; });
      leverPivot.rotation.y = -p * 0.25;
      if (Math.abs(p - lastPull) > 0.0005) { buildCable(); lastPull = p; }

      const target = s.spinning ? 3 : 0;
      if (p < 0.35) wheelSpeed += (target - wheelSpeed) * Math.min(1, dt * 0.8);
      else wheelSpeed = Math.max(0, wheelSpeed - (p - 0.35) * 9 * dt);
      frontSpin.rotation.z -= wheelSpeed * dt;
      rearSpin.rotation.z -= wheelSpeed * dt;

      const k = Math.min(1, dt * 6);
      cam.target.lerp(goal.target, k);
      cam.r += (goal.r - cam.r) * k;
      cam.theta += (goal.theta - cam.theta) * k;
      cam.phi += (goal.phi - cam.phi) * k;
      camera.position.set(
        cam.target.x + cam.r * Math.sin(cam.phi) * Math.sin(cam.theta),
        cam.target.y + cam.r * Math.cos(cam.phi),
        cam.target.z + cam.r * Math.sin(cam.phi) * Math.cos(cam.theta)
      );
      camera.lookAt(cam.target);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("wheel", onWheel);
      scene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); });
      renderer.dispose();
      mount.removeChild(el);
    };
  }, []);

  const onSlider = (e) => {
    const v = parseFloat(e.target.value);
    setPlaying(false);
    sim.current.playing = false;
    sim.current.pull = v;
    syncUI(v);
  };

  const part = selected && selected !== "ghost" ? PARTS[selected] : null;

  return (
    <div className="bv">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&family=Barlow:wght@400;500&display=swap');
        .bv{--paper:#E6EAEC;--panel:#F2F4F5;--ink:#16232B;--muted:#56656D;--blue:#1C7DB1;--amber:#E0951A;--rule:#C2CCD1;
          font-family:Barlow,system-ui,sans-serif;color:var(--ink);background:var(--paper);display:grid;grid-template-columns:minmax(0,1fr) 340px;min-height:100vh}
        .stage{position:relative;height:100vh}
        .mount{position:absolute;inset:0}
        .mount canvas{touch-action:none;cursor:grab}
        .head{position:absolute;top:18px;left:20px;pointer-events:none}
        .head h1{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:36px;line-height:1;margin:0}
        .head p{margin:6px 0 0;color:var(--muted);font-size:14px;max-width:34ch;line-height:1.45}
        .views{position:absolute;top:18px;right:16px;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;max-width:50%}
        .chip{font:500 13px Barlow,sans-serif;padding:6px 11px;border-radius:6px;border:1px solid var(--rule);background:var(--panel);color:var(--ink);cursor:pointer}
        .chip[aria-pressed="true"]{background:var(--ink);color:#fff;border-color:var(--ink)}
        .chip:focus-visible,.btn:focus-visible,input:focus-visible{outline:2px solid var(--blue);outline-offset:2px}
        .zoom{position:absolute;right:16px;bottom:16px;display:flex;flex-direction:column;gap:6px}
        .zoom .chip{width:36px;height:36px;font-size:18px;padding:0}
        .note{position:absolute;left:20px;bottom:16px;font-size:12px;color:var(--muted);max-width:42ch;line-height:1.4;pointer-events:none}
        .side{border-left:1px solid var(--rule);background:var(--panel);display:flex;flex-direction:column;max-height:100vh}
        .controls{padding:20px;border-bottom:1px solid var(--rule)}
        .row{display:flex;justify-content:space-between;align-items:baseline}
        .label{font-weight:500;font-size:14px}
        .readout{font-family:'Barlow Condensed',sans-serif;font-size:28px;font-weight:500;color:var(--blue)}
        input[type=range]{width:100%;accent-color:var(--amber);margin:6px 0 10px}
        .status{font-size:14px;line-height:1.5;min-height:63px;margin:0 0 14px;padding-left:10px;border-left:3px solid var(--amber)}
        .btns{display:flex;gap:6px;flex-wrap:wrap}
        .btn{font:500 14px Barlow,sans-serif;padding:8px 12px;border-radius:6px;border:1px solid var(--rule);background:#fff;color:var(--ink);cursor:pointer}
        .btn.primary{background:var(--blue);border-color:var(--blue);color:#fff}
        .btn[aria-pressed="true"]{border-color:var(--ink);box-shadow:inset 0 0 0 1px var(--ink)}
        .info{padding:20px;overflow:auto;line-height:1.5}
        .info h2{font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:28px;line-height:1.05;margin:0 0 4px}
        .meta{color:var(--muted);font-size:13px;margin:0 0 12px}
        .info h3{font-size:14px;font-weight:500;margin:18px 0 6px}
        .info ul{margin:0;padding-left:18px;font-size:14px}
        .info li{margin-bottom:4px}
        .links{display:flex;flex-wrap:wrap;gap:6px}
        .empty{color:var(--muted);font-size:14px}
        @media (max-width:820px){.bv{grid-template-columns:1fr}.stage{height:58vh}.side{border-left:0;border-top:1px solid var(--rule);max-height:none}.views{max-width:60%}}
        @media (prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
      `}</style>

      <div className="stage">
        <div className="mount" ref={mountRef} />
        <div className="head">
          <h1>CD200 front brake</h1>
          <p>Drag to turn, scroll to zoom, tap a part to read about it.</p>
        </div>
        <div className="views" role="group" aria-label="Camera view">
          {VIEW_LABELS.map(([k, label]) => (
            <button key={k} className="chip" aria-pressed={view === k} onClick={() => { setView(k); apiRef.current.setView?.(k); }}>{label}</button>
          ))}
        </div>
        <div className="zoom">
          <button className="chip" aria-label="Zoom in" onClick={() => apiRef.current.zoom?.(0.8)}>+</button>
          <button className="chip" aria-label="Zoom out" onClick={() => apiRef.current.zoom?.(1.25)}>−</button>
        </div>
        <p className="note">Faded shapes are placeholders for scale. Shoe movement is enlarged so you can see it.</p>
      </div>

      <aside className="side">
        <div className="controls">
          <div className="row">
            <label className="label" htmlFor="pull">Brake lever pull</label>
            <span className="readout" ref={readoutRef}>0%</span>
          </div>
          <input id="pull" ref={sliderRef} type="range" min="0" max="1" step="0.01" defaultValue="0" onInput={onSlider} />
          <p className="status" ref={statusRef} aria-live="polite">{statusText(0)}</p>
          <div className="btns">
            <button className="btn primary" onClick={() => setPlaying((v) => !v)}>{playing ? "Pause demo" : "Play demo"}</button>
            <button className="btn" aria-pressed={spinning} onClick={() => setSpinning((v) => !v)}>Wheel turning</button>
            <button className="btn" aria-pressed={xray} onClick={() => setXray((v) => !v)}>X-ray</button>
          </div>
        </div>

        <div className="info">
          {part ? (
            <>
              <h2>{part.name}</h2>
              <p className="meta">
                {part.system}, {part.layer === "internal" ? "inside the hub (turn on X-ray to see it)" : "visible from outside"}
              </p>
              <p>{part.description}</p>
              <h3>Common faults</h3>
              <ul>{part.faults.map((f) => <li key={f}>{f}</li>)}</ul>
              <h3>Connected to</h3>
              <div className="links">
                {part.connectedTo.map((id) => (
                  <button key={id} className="chip" onClick={() => setSelected(id)}>{PARTS[id]?.name ?? id}</button>
                ))}
              </div>
            </>
          ) : selected === "ghost" ? (
            <>
              <h2>Not modelled yet</h2>
              <p className="empty">This is a rough shape for scale. It becomes a real part when we reach its system.</p>
            </>
          ) : (
            <p className="empty">
              Tap a part to see what it does and how it fails. Try the lever on the right handlebar, or choose Brake side and turn on X-ray to watch the shoes.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
