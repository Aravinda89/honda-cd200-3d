import { VIEW_LABELS } from "../data/views";
import { useStore } from "../store";
import type { ViewKey } from "../types";

export function ViewPresets() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);

  const selectView = (key: ViewKey) => {
    setView(key);
    useStore.getState().cameraApi?.setView(key);
  };

  return (
    <div className="views" role="group" aria-label="Camera view">
      {VIEW_LABELS.map(([key, label]) => (
        <button key={key} className="chip" aria-pressed={view === key} onClick={() => selectView(key)}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function ZoomControls() {
  return (
    <div className="zoom">
      <button className="chip" aria-label="Zoom in" onClick={() => useStore.getState().cameraApi?.zoom(0.8)}>
        +
      </button>
      <button className="chip" aria-label="Zoom out" onClick={() => useStore.getState().cameraApi?.zoom(1.25)}>
        −
      </button>
    </div>
  );
}
