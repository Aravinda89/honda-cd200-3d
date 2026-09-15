import { useEffect } from "react";
import { useStore } from "../store";
import type { PartsById } from "../types";

/** Fetches public/data/parts.json once and fills the store. */
export function useParts() {
  const setParts = useStore((s) => s.setParts);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/parts.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load parts.json: ${res.status}`);
        return res.json() as Promise<PartsById>;
      })
      .then((parts) => {
        if (!cancelled) setParts(parts);
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      cancelled = true;
    };
  }, [setParts]);
}
