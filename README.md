# Honda CD200 3D

An interactive 3D viewer that shows a Honda CD200 Roadmaster motorcycle
system by system (brakes, wheels, suspension, drivetrain, electrical, fuel,
engine), so you can see how each part works, moves, and fails. Personal
portfolio project.

**Live:** [honda-cd200-3d.vercel.app](https://honda-cd200-3d.vercel.app)

## Tech stack

- [Vite](https://vite.dev/) + React + TypeScript
- [react-three-fiber](https://docs.pmnd.rs/react-three-fiber) and [drei](https://github.com/pmndrs/drei) (OrbitControls, etc.) for the 3D scene
- [zustand](https://zustand-demo.pmnd.rs/) for app state (selected part, view, lever/crank input, x-ray)
- No backend, no database — static site
- Deployed on [Vercel](https://vercel.com) (Hobby plan): every push to `main` deploys to production, other branches get preview URLs

## Running locally

Requires [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

### Other scripts

| Command           | What it does                        |
| ------------------ | ------------------------------------ |
| `npm run build`    | Type-check and build for production  |
| `npm run preview`  | Preview the production build locally |
| `npm run lint`     | Type-check without emitting files    |

## Project layout

```
public/models/<system>.glb   3D models, one per system (added as they're built)
public/data/parts.json       part names, descriptions, faults, specs
src/components/              shared UI: viewer canvas, controls, info panel
src/systems/<system>/        geometry and animation logic for each system
src/store.ts                 app state (selected part, view, x-ray, etc.)
reference/                   prototype and reference material, not shipped
```

See [CLAUDE.md](CLAUDE.md) for the full project brief and conventions.

## Roadmap

Done (front brake prototype, ported):
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
