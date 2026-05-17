import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Download,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workflow", label: "Progress", icon: Workflow },
  { to: "/results", label: "Plan", icon: FileText },
  { to: "/exports", label: "Downloads", icon: Download },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex w-full">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar/80 backdrop-blur-xl">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="relative h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center ring-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-semibold tracking-tight">Genesis Forge</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Project builder
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = path === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-gradient-primary" />
                )}
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Project builder</span>
              <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                ready
              </Badge>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Plans and downloads work locally in the browser.
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="h-full px-4 md:px-8 flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-gradient-primary grid place-items-center">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-display text-sm font-semibold">Genesis Forge</span>
            </div>
            <div className="ml-auto md:ml-0 flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search projects and plans..."
                  className="pl-9 h-9 bg-surface/60 border-border/60"
                />
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-block text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">
                  Ctrl K
                </kbd>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-gradient-primary grid place-items-center text-xs font-semibold text-primary-foreground">
                GF
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-10 max-w-[1400px] w-full mx-auto">
          {children}
        </main>

        <nav className="md:hidden sticky bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-xl">
          <div className="grid grid-cols-4">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = path === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[10px]",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
