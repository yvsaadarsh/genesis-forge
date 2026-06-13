import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { useRuns } from "@/lib/runs-store";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
  head: () => ({ meta: [{ title: "Plan - Genesis Forge" }] }),
});

function ResultsPage() {
  const runs = useRuns();
  const projects = runs.filter((r) => r.status === "complete" || r.status === "running");

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Generated work"
        title="Project plan."
        description="Inspect the actual generated output: summary, app structure, screens, and starter code."
      />

      {projects.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-surface border border-border/60 grid place-items-center mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold">No project plan yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Generate a project and its plan will appear here.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-gradient-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Generate a project
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {projects.map((r) => (
            <ResultsPanel key={r.id} run={r} />
          ))}
        </div>
      )}
    </div>
  );
}
