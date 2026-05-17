import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Workflow } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { WorkflowTimeline } from "@/components/workflow/WorkflowTimeline";
import { useRuns } from "@/lib/runs-store";

export const Route = createFileRoute("/workflow")({
  component: WorkflowPage,
  validateSearch: (s: Record<string, unknown>) => ({
    run: typeof s.run === "string" ? s.run : undefined,
  }),
  head: () => ({ meta: [{ title: "Progress - Genesis Forge" }] }),
});

function WorkflowPage() {
  const { run: runId } = useSearch({ from: "/workflow" });
  const runs = useRuns();
  const active = runId ? runs.find((r) => r.id === runId) : runs[0];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Progress"
        title="Generation progress."
        description="See exactly what the app is preparing before the plan and downloads are ready."
      />

      {active ? (
        <WorkflowTimeline run={active} />
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-surface border border-border/60 grid place-items-center mb-4">
            <Workflow className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold">No project is generating</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Start from the dashboard to create a plan and downloadable files.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center justify-center rounded-md bg-gradient-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Go to dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
