import { Link } from "@tanstack/react-router";
import { Download, FileCode, FileJson, FileText, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadProject } from "@/lib/download-files";
import { getProjectOutput } from "@/lib/project-output";
import { useRuns } from "@/lib/runs-store";

const formats = [
  {
    key: "pdf",
    label: "PDF",
    desc: "Readable report you can open now",
    icon: FileText,
    color: "text-rose-300",
  },
  {
    key: "md",
    label: "Markdown",
    desc: "Full plan and starter files",
    icon: FileCode,
    color: "text-emerald-300",
  },
  {
    key: "json",
    label: "JSON",
    desc: "Structured project data",
    icon: FileJson,
    color: "text-amber-300",
  },
  {
    key: "zip",
    label: "Starter ZIP",
    desc: "README and starter source files",
    icon: Package,
    color: "text-primary",
  },
] as const;

export function ExportCenter() {
  const runs = useRuns();
  const latest = runs.find((r) => r.status === "complete") ?? runs[0];
  const output = latest ? getProjectOutput(latest) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">Downloads</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {latest
                ? "Download the generated work immediately. No queue, no waiting."
                : "Generate a project to unlock downloads."}
            </p>
          </div>
          {latest && (
            <Badge variant="outline" className="border-primary/40 text-primary">
              {latest.status === "complete" ? "Ready" : "Generating"}
            </Badge>
          )}
        </div>
      </div>

      {!latest || !output ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-sm text-muted-foreground">No downloads available yet.</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-gradient-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Generate a project
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {formats.map((f) => (
            <div
              key={f.key}
              className="glass rounded-xl p-5 group hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-surface grid place-items-center border border-border/60">
                  <f.icon className={`h-4 w-4 ${f.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{f.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadProject(f.key, latest, output)}
                  className="opacity-70 group-hover:opacity-100"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
