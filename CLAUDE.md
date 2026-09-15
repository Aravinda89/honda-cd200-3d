# Classic Bike 3D Systems Viewer

Interactive 3D web app showing a Honda CD200 Roadmaster motorcycle system by
system (brakes, wheels, suspension, drivetrain, electrical, fuel, engine) so
mechanics can learn how each part works, moves, and fails.
Personal portfolio project. Static site, free hosting.

## Stack
- Vite + React + TypeScript
- @react-three/fiber and @react-three/drei (OrbitControls, Html, etc.)
- zustand for app state (selected part, visible systems, view, lever/crank input, x-ray)
- No backend, no database
- Deployed to GitHub Pages via GitHub Actions
  (Vite `base` must be `/classic-bike-3d/`)

## Folder layout
```
public/models/<system>.glb        one compressed GLB per system (added later from Blender)
public/data/parts.json            all part info, keyed by part id
reference/prototype/              working single-file prototype to port from
reference/photos/<system>/        real bike photos (do not publish)
reference/manual/                 manual scans (do not publish)
src/components/                   Viewer, InfoPanel, SystemToggle, ViewPresets, Controls
src/systems/<system>/             placeholder geometry, GLB loader, animation logic
src/store.ts                      zustand store
```

## Bike coordinates (Honda CD200, stock)
- Units: 1 unit = 1 metre, real scale
- Origin: on the ground, midway between the two axles
- Web (glTF): +X = front, +Y = up, +Z = bike's right side
- Blender: +X = front, +Z = up, -Y = bike's right side
  (the glTF exporter converts this automatically)
- Front axle: x = +0.640, y = 0.29; rear axle: x = -0.640, y = 0.29
- Overall envelope: length 1.990, width 0.845, height 1.105
- Wheels: 17-inch rim (0.4318 m), 3.00 tyre, approx. 0.585 m overall diameter (to confirm)
- Front brake: single leading shoe (SLS) drum, 140 mm inner diameter
- Front brake side: LEFT for now (to confirm from photos); keep it a single constant
- Brake lever: right handlebar

## Core rules
- Part ids follow `system_location_part_side`, e.g. `brake_front_cam_arm`.
  Brake shoes use `leading` / `trailing` instead of L/R.
  Mesh names in GLB files and ids in parts.json must match exactly.
- Part information lives in parts.json, never hard-coded in components.
- Animation is driven by code, not keyframes. Each moving part rotates or
  slides around its origin (pivot) from one shared input value:
  brake lever pull 0–1 now, crank angle 0–720° for the engine later.
  This allows scrubbing, play/pause, and slow motion.
- Until a Blender GLB exists for a system, use placeholder geometry built in
  code with the same part ids. Swapping in the GLB must not change any other code.
- Parts not modelled yet are faded "ghost" shapes for scale only; clicking one
  shows "Not modelled yet".
- Cables, wires, fuel lines, spokes, and chains may stay code-generated
  (TubeGeometry along curves, instanced repeats, line segments).
- Rotating wheel parts (tyre, rim, spokes, hub/drum) live in a spinning group;
  brake parts (backing plate, shoes, cam, anchor pin, springs, cam arm) do NOT spin.
- Each part reads `layer` ("exterior" | "internal") from parts.json.
  Exterior parts that cover internals (tyre, hub, backing plate) fade in
  x-ray mode and are ignored by click picking while x-ray is on.
- Each system GLB is lazy-loaded only when that system is switched on.
- Compress models with gltf-transform (meshopt or Draco, WebP/KTX2 textures).
- Must work on phones: low draw calls, test at 390 px width, touch orbit.
- Accessibility: keyboard-focusable controls, visible focus, aria-live status text.
- Do not include manufacturer logos, scanned manual pages, or third-party photos
  in the site. Write all descriptions in original wording.

## parts.json entry format
```json
{
  "brake_front_shoe_leading": {
    "name": "Front brake shoe (leading)",
    "system": "brakes",
    "layer": "internal",
    "partNumber": "",
    "material": "",
    "description": "",
    "specs": { "liningThicknessMm": null, "serviceLimitMm": null },
    "faults": [],
    "connectedTo": ["brake_front_cam", "brake_front_anchor_pin"]
  }
}
```
Empty strings and nulls mean "not yet taken from the manual"; show them as
"To be added" in the UI, never invent values.

## Blender collections (for later GLB exports)
_REFERENCE, _MOUNTS, frame, wheels, suspension, brakes, drivetrain,
electrical, fuel, engine, bodywork, accessories.
`accessories` holds the owner's extras (crash bar, rear rack, pillion pad,
front plate frame) so the viewer can toggle "Stock CD200" / "My bike".

## Features
Done in prototype (port first):
1. Whole bike at real scale with ghost placeholders
2. Front drum brake: lever slider, play demo, cam arm/cam/shoes/springs/lever/cable animation
3. Wheel spin that slows when the brake bites
4. Click a part: highlight + info panel (description, faults, connected parts as links)
5. X-ray mode, view presets (whole bike, brake side, handlebar, front), zoom buttons
6. "What's happening" status text that changes with lever pull

Next, in order:
7. System toggles and "Stock / My bike" toggle
8. Exploded view (parts slide apart along assembly direction)
9. Guided scenarios (e.g. "Pull the front brake") with step-by-step text
10. Rear brake, wheels, suspension, drivetrain, electrical, fuel, engine
    (engine: 360° parallel twin, 53 x 44 mm, SOHC, 4-speed)

## Workflow
- Run `npm run dev` and check the browser after every change; fix console errors.
- Keep commits small, one feature each, with clear messages.
- Update this file when a rule or decision changes.
