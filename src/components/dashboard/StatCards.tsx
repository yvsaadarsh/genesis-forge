import { motion } from "framer-motion";
import { Activity, Download, FileText, Layers } from "lucide-react";
import { useRuns } from "@/lib/runs-store";

export function StatCards() {
  const runs = useRuns();
  const complete = runs.filter((r) => r.status === "complete").length;
  const running = runs.filter((r) => r.status === "running").length;

  const stats = [
    { label: "Projects created", value: runs.length, icon: FileText },
    { label: "Plans ready", value: complete, icon: Layers },
    { label: "Generating now", value: running, icon: Activity },
    { label: "Export formats", value: 4, icon: Download },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-xl p-4 relative overflow-hidden group"
        >
          <div className="flex items-start justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <s.icon className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="font-display text-2xl font-semibold tracking-tight tabular-nums">
              {s.value}
            </div>
          </div>
          <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      ))}
    </div>
  );
}
