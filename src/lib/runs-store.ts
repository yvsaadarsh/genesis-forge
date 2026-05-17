// Lightweight client-side run store. Replaces hardcoded demo data with
// real, user-created runs persisted in localStorage so the UI reflects
// actual activity instead of placeholders.
import { useEffect, useState } from "react";
import { createProjectOutput, type ProjectOutput } from "@/lib/project-output";

export type RunStatus = "queued" | "running" | "complete" | "failed";

export type Run = {
  id: string;
  title: string;
  source: "upload" | "idea" | "url";
  tag?: string;
  status: RunStatus;
  createdAt: number;
  stage?: string;
  output?: ProjectOutput;
};

const KEY = "genesisForge.runs";
const EVENT = "genesis-forge:runs";

function read(): Run[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(runs: Run[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(runs));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export const runsStore = {
  list(): Run[] {
    return read().sort((a, b) => b.createdAt - a.createdAt);
  },
  get(id: string): Run | undefined {
    return read().find((r) => r.id === id);
  },
  create(input: { title: string; source: Run["source"]; tag?: string }): Run {
    const run: Run = {
      id: `project_${Date.now().toString(36)}`,
      title: input.title,
      source: input.source,
      tag: input.tag,
      status: "running",
      createdAt: Date.now(),
      stage: "ingest",
      output: createProjectOutput(input.title, input.source),
    };
    write([run, ...read()]);
    return run;
  },
  update(id: string, patch: Partial<Run>) {
    write(read().map((r) => (r.id === id ? { ...r, ...patch } : r)));
  },
  clear() {
    write([]);
  },
  subscribe(cb: () => void) {
    if (typeof window === "undefined") return () => {};
    const handler = () => cb();
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  },
};

export function useRuns(): Run[] {
  const [runs, setRuns] = useState<Run[]>([]);
  useEffect(() => {
    setRuns(runsStore.list());
    return runsStore.subscribe(() => setRuns(runsStore.list()));
  }, []);
  return runs;
}
