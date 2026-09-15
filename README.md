# Honda CD200 3D

An interactive 3D viewer that shows a Honda CD200 Roadmaster motorcycle
system by system (brakes, wheels, suspension, drivetrain, electrical, fuel,
engine), so you can see how each part works, moves, and fails.

Built with Vite, React, TypeScript, [react-three-fiber](https://docs.pmnd.rs/react-three-fiber) / drei, and zustand.

## Getting started

Requires [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

## Scripts

| Command           | What it does                          |
| ------------------ | -------------------------------------- |
| `npm run dev`      | Start the dev server with hot reload   |
| `npm run build`    | Type-check and build for production    |
| `npm run preview`  | Preview the production build locally   |
| `npm run lint`     | Type-check without emitting files      |

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

## Deployment

Deployed on [Vercel](https://vercel.com): every push to `main` deploys to
production, other branches get preview URLs.
