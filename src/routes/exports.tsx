import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { ExportCenter } from "@/components/exports/ExportCenter";

export const Route = createFileRoute("/exports")({
  component: ExportsPage,
  head: () => ({ meta: [{ title: "Downloads - Genesis Forge" }] }),
});

function ExportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Downloads"
        title="Download the work."
        description="Get the visible project plan as PDF, Markdown, JSON, or a starter ZIP immediately."
      />
      <ExportCenter />
    </div>
  );
}
