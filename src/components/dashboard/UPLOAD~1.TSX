import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileText, Link as LinkIcon, Sparkles, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { runsStore } from "@/lib/runs-store";

export function UploadArea() {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [idea, setIdea] = useState("");
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    setFile(files[0]);
    toast.success(`Loaded ${files[0].name}`);
  }, []);

  const onGenerate = async () => {
    let title = "";
    let source: "upload" | "idea" | "url" = "upload";
    let ideaText = "";
    if (file) {
      title = file.name.replace(/\.[^.]+$/, "");
      source = "upload";
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (["txt", "md", "markdown", "csv", "json"].includes(ext)) {
        try {
          ideaText = (await file.text()).slice(0, 6000);
        } catch {
          ideaText = "";
        }
      }
      if (!ideaText.trim()) ideaText = `Project brief from uploaded file named "${file.name}".`;
    } else if (idea.trim()) {
      source = "idea";
      ideaText = idea.trim();
      title = idea.trim().replace(/\s+/g, " ").slice(0, 60);
    } else if (url.trim()) {
      source = "url";
      title = url.trim();
      ideaText = `Build a project based on this source: ${url.trim()}`;
    } else {
      toast.error("Add a file, idea, or URL first");
      return;
    }

    const run = runsStore.create({ title, source, idea: ideaText });
    toast.message("Generating your project", {
      description: "The plan and downloads will be ready in a few seconds.",
    });
    setTimeout(() => navigate({ to: "/workflow", search: { run: run.id } as never }), 350);
  };

  return (
    <div className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />
      <div className="relative">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <Badge variant="outline" className="mb-2 border-primary/40 text-primary">
              AI-assisted planner
            </Badge>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Generate a new project
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a brief, paste an idea, or link a source. The app creates a readable plan and
              downloadable files.
            </p>
          </div>
          <Button
            onClick={onGenerate}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow ring-glow"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>

        <Tabs defaultValue="upload">
          <TabsList className="bg-surface/60 border border-border/60">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="idea">Idea</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 px-6 cursor-pointer transition-all ${
                drag
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/60 hover:bg-surface/40"
              }`}
            >
              <input
                type="file"
                accept=".pdf,.md,.txt,.docx"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <motion.div
                animate={{ y: drag ? -4 : 0 }}
                className="h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center ring-glow"
              >
                <UploadCloud className="h-7 w-7 text-primary-foreground" />
              </motion.div>
              {file ? (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>{file.name}</span>
                  <span className="text-muted-foreground">
                    - {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium">Drop your brief here</div>
                  <div className="text-xs text-muted-foreground">
                    PDF, Markdown, DOCX - up to 30MB
                  </div>
                </>
              )}
            </label>
          </TabsContent>

          <TabsContent value="idea" className="mt-4">
            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe the project you want to build..."
              className="min-h-[160px] bg-surface/60 border-border/60 resize-none font-mono text-sm"
            />
          </TabsContent>

          <TabsContent value="url" className="mt-4">
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/source"
                className="pl-9 bg-surface/60 border-border/60"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
