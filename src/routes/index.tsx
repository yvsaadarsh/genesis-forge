import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { RecentRuns } from "@/components/dashboard/RecentRuns";
import { StatCards } from "@/components/dashboard/StatCards";
import { UploadArea } from "@/components/dashboard/UploadArea";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard - Genesis Forge" },
      {
        name: "description",
        content: "Generate readable project plans and downloadable starter files.",
      },
    ],
  }),
});

function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Project builder"
        title="Turn rough ideas into project plans."
        description="Genesis Forge creates a readable plan, starter files, and direct downloads from a document, URL, or idea."
        actions={
          <Badge variant="outline" className="border-primary/40 text-primary py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2" />
            Ready
          </Badge>
        }
      />

      <StatCards />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <UploadArea />
        </div>
        <div className="lg:col-span-2">
          <RecentRuns />
        </div>
      </div>
    </div>
  );
}
