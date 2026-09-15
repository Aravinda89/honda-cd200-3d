import { Viewer } from "./components/Viewer";
import { ViewPresets, ZoomControls } from "./components/ViewPresets";
import { Controls } from "./components/Controls";
import { InfoPanel } from "./components/InfoPanel";
import { useParts } from "./hooks/useParts";

export default function App() {
  useParts();

  return (
    <div className="bv">
      <div className="stage">
        <div className="mount">
          <Viewer />
        </div>
        <div className="head">
          <h1>CD200 front brake</h1>
          <p>Drag to turn, scroll to zoom, tap a part to read about it.</p>
        </div>
        <ViewPresets />
        <ZoomControls />
        <p className="note">Faded shapes are placeholders for scale. Shoe movement is enlarged so you can see it.</p>
      </div>

      <aside className="side">
        <Controls />
        <InfoPanel />
      </aside>
    </div>
  );
}
