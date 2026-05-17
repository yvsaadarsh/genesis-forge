import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Circle, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRuns } from "@/lib/runs-store";

const statusColor = {
  complete: "text-emerald-400",
  running: "text-primary",
  queued: "text-muted-foreground",
  failed: "text-destructive",
} as const;

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function RecentRuns() {
  const runs = useRuns().slice(0, 6);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-semibold">Recent projects</h3>
        {runs.length > 0 && (
          <Link
            to="/results"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {runs.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10 px-4">
          <div className="h-10 w-10 rounded-xl bg-surface border border-border/60 grid place-items-center mb-3">
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No projects yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
            Generate your first project and it will appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border/60">
          {runs.map((r) => (
            <li key={r.id} className="py-3 flex items-center gap-3 group">
              <Circle className={`h-2 w-2 fill-current ${statusColor[r.status]}`} />
              <div className="min-w-0 flex-1">
                <div className="text-sm truncate group-hover:text-primary transition-colors">
                  {r.title}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                  <span>{r.status === "complete" ? "Ready" : "Generating"}</span>
                  <span>-</span>
                  <span>{timeAgo(r.createdAt)}</span>
                </div>
              </div>
              {r.tag && (
                <Badge variant="outline" className="text-[10px] border-border/60">
                  {r.tag}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
