import { statusText } from "../data/views";
import { useStore } from "../store";

export function Controls() {
  const pull = useStore((s) => s.pull);
  const playing = useStore((s) => s.playing);
  const spinning = useStore((s) => s.spinning);
  const xray = useStore((s) => s.xray);
  const setPull = useStore((s) => s.setPull);
  const setPlaying = useStore((s) => s.setPlaying);
  const togglePlaying = useStore((s) => s.togglePlaying);
  const toggleSpinning = useStore((s) => s.toggleSpinning);
  const toggleXray = useStore((s) => s.toggleXray);

  const onSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaying(false);
    setPull(parseFloat(e.target.value));
  };

  return (
    <div className="controls">
      <div className="row">
        <label className="label" htmlFor="pull">
          Brake lever pull
        </label>
        <span className="readout">{Math.round(pull * 100)}%</span>
      </div>
      <input id="pull" type="range" min="0" max="1" step="0.01" value={pull} onChange={onSlider} />
      <p className="status" aria-live="polite">
        {statusText(pull)}
      </p>
      <div className="btns">
        <button className="btn primary" onClick={togglePlaying}>
          {playing ? "Pause demo" : "Play demo"}
        </button>
        <button className="btn" aria-pressed={spinning} onClick={toggleSpinning}>
          Wheel turning
        </button>
        <button className="btn" aria-pressed={xray} onClick={toggleXray}>
          X-ray
        </button>
      </div>
    </div>
  );
}
