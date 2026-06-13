import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Code2, FileSearch, Layers, Loader2, PackageCheck, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Run } from "@/lib/runs-store";

const STAGES = [
  {
    key: "ingest",
    label: "Read source",
    desc: "Collect the uploaded file, idea, or URL",
    icon: FileSearch,
  },
  {
    key: "goal",
    label: "Find the product goal",
    desc: "Turn rough input into a clear project direction",
    icon: PenTool,
  },
  {
    key: "screens",
    label: "Plan screens",
    desc: "Define the main pages and user actions",
    icon: Layers,
  },
  {
    key: "structure",
    label: "Design app structure",
    desc: "Create features, data shape, and file layout",
    icon: Code2,
  },
  {
    key: "generate",
    label: "Write starter files",
    desc: "Prepare README, React screen, and structured plan",
    icon: Code2,
  },
  {
    key: "validate",
    label: "Prepare downloads",
    desc: "Make PDF, Markdown, JSON, and ZIP exports available",
    icon: PackageCheck,
  },
] as const;

export function WorkflowTimeline({ run }: { run: Run }) {
  const [stageIdx, setStageIdx] = useState(() => {
    const i = STAGES.findIndex((s) => s.key === run.stage);
    return i < 0 ? 0 : i;
  });

  useEffect(() => {
    // When the AI generation finishes, the run flips to "complete" in the store.
    if (run.status === "complete") {
      setStageIdx(STAGES.length);
      return;
    }
    // Otherwise advance through the visible stages, then hold on the final stage
    // (spinner) until the real plan is ready instead of faking completion.
    if (stageIdx >= STAGES.length - 1) return;
    const t = setTimeout(() => setStageIdx((i) => Math.min(i + 1, STAGES.length - 1)), 900);
    return () => clearTimeout(t);
  }, [stageIdx, run.status]);

  const complete = run.status === "complete";

  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold tracking-tight truncate">
            {complete ? "Project ready" : "Generating project"}
          </h2>
          <p className="text-sm text-muted-foreground truncate">{run.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <span className="relative inline-flex h-2 w-2">
              {!complete && (
                <span className="absolute inset-0 rounded-full bg-primary pulse-ring" />
              )}
              <span
                className={cn(
                  "relative h-2 w-2 rounded-full",
                  complete ? "bg-emerald-400" : "bg-primary",
                )}
              />
            </span>
            {complete ? "Ready" : "Working"}
          </div>
          {complete && (
            <Button
              asChild
              size="sm"
              className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            >
              <Link to="/results">View plan</Link>
            </Button>
          )}
        </div>
      </div>

      <ol className="relative flex flex-col gap-5">
        <span className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-border to-transparent" />
        {STAGES.map((s, i) => {
          const done = i < stageIdx || complete;
          const running = i === stageIdx && !complete;
          const Icon = s.icon;
          return (
            <motion.li
              key={s.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative flex items-start gap-4 pl-1"
            >
              <div
                className={cn(
                  "relative z-10 h-11 w-11 rounded-xl grid place-items-center border",
                  done && "bg-primary/10 border-primary/40 text-primary",
                  running &&
                    "bg-gradient-primary text-primary-foreground border-transparent ring-glow",
                  !done && !running && "bg-surface border-border text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : running ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 pt-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{s.label}</span>
                  {running && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      working
                    </span>
                  )}
                  {done && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                      done
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                {running && (
                  <div className="mt-2 h-1 rounded-full bg-surface overflow-hidden max-w-md">
                    <div className="h-full w-1/2 bg-gradient-primary shimmer" />
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
