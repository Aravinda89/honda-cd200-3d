import { useStore } from "../store";

export function InfoPanel() {
  const selected = useStore((s) => s.selected);
  const parts = useStore((s) => s.parts);
  const setSelected = useStore((s) => s.setSelected);

  const part = selected && selected !== "ghost" ? parts[selected] : null;

  if (part) {
    return (
      <div className="info">
        <h2>{part.name}</h2>
        <p className="meta">
          {part.system}, {part.layer === "internal" ? "inside the hub (turn on X-ray to see it)" : "visible from outside"}
        </p>
        <p>{part.description}</p>
        {part.faults.length > 0 && (
          <>
            <h3>Common faults</h3>
            <ul>
              {part.faults.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </>
        )}
        {part.connectedTo.length > 0 && (
          <>
            <h3>Connected to</h3>
            <div className="links">
              {part.connectedTo.map((id) => (
                <button key={id} className="chip" onClick={() => setSelected(id)}>
                  {parts[id]?.name ?? id}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (selected === "ghost") {
    return (
      <div className="info">
        <h2>Not modelled yet</h2>
        <p className="empty">This is a rough shape for scale. It becomes a real part when we reach its system.</p>
      </div>
    );
  }

  return (
    <div className="info">
      <p className="empty">
        Tap a part to see what it does and how it fails. Try the lever on the right handlebar, or choose Brake side
        and turn on X-ray to watch the shoes.
      </p>
    </div>
  );
}
