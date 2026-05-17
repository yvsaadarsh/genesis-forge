import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Copy, Download, FileCode2, ListTree, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProjectOutput, renderMarkdown } from "@/lib/project-output";
import type { Run } from "@/lib/runs-store";

export function ResultsPanel({ run }: { run: Run }) {
  const [tab, setTab] = useState("overview");
  const output = getProjectOutput(run);

  const onCopy = () => {
    navigator.clipboard.writeText(renderMarkdown(run.title, output, run.id, run.status));
    toast.success("Plan copied");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 md:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Sparkles className="h-3 w-3 text-primary" />
            Generated project
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight truncate">
            {run.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Your generated plan, app structure, and starter files are visible below.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy plan
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
          >
            <Link to="/exports">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Downloads
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-surface/60 border border-border/60">
          <TabsTrigger value="overview">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="architecture">
            <ListTree className="h-3.5 w-3.5 mr-1.5" />
            App Structure
          </TabsTrigger>
          <TabsTrigger value="code">
            <FileCode2 className="h-3.5 w-3.5 mr-1.5" />
            Starter Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5 flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-foreground/90">{output.summary}</p>
          <div className="grid md:grid-cols-2 gap-4">
            <section className="rounded-xl border border-border/60 p-5">
              <h3 className="text-sm font-medium mb-2">Problem</h3>
              <p className="text-sm text-muted-foreground">{output.problem}</p>
            </section>
            <section className="rounded-xl border border-border/60 p-5">
              <h3 className="text-sm font-medium mb-2">Audience</h3>
              <p className="text-sm text-muted-foreground">{output.audience}</p>
            </section>
          </div>
          <section className="rounded-xl border border-border/60 p-5">
            <h3 className="text-sm font-medium mb-3">Core features</h3>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              {output.features.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </section>
        </TabsContent>

        <TabsContent value="architecture" className="mt-5 flex flex-col gap-4">
          <section className="rounded-xl border border-border/60 p-5">
            <h3 className="text-sm font-medium mb-3">Implementation shape</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {output.architecture.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl border border-border/60 p-5">
            <h3 className="text-sm font-medium mb-3">Screens</h3>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              {output.screens.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </section>
        </TabsContent>

        <TabsContent value="code" className="mt-5 flex flex-col gap-4">
          {output.files.map((file) => (
            <section key={file.path} className="rounded-xl border border-border/60 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
                <div>
                  <h3 className="text-sm font-medium font-mono">{file.path}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{file.purpose}</p>
                </div>
              </div>
              <pre className="overflow-auto bg-background/50 p-4 text-xs leading-relaxed">
                <code>{file.content}</code>
              </pre>
            </section>
          ))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
