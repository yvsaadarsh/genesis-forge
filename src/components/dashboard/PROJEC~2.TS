import { createServerFn } from "@tanstack/react-start";
import {
  buildFromAi,
  createProjectOutput,
  type ProjectOutput,
} from "@/lib/project-output";

export type GenerateInput = {
  title: string;
  idea: string;
  source: "upload" | "idea" | "url";
};

const SYSTEM_PROMPT = `You are a senior software architect and product strategist.
You receive a raw project idea and must produce a CONCRETE, REALISTIC plan that is
specific to that exact idea and its technical domain. Never produce generic,
vague, or buzzword-only output. Every field must clearly reference the real topic.
Respond with ONLY a JSON object (no markdown, no prose) using EXACTLY these keys:
{
  "summary": string,            // 2-3 sentences describing this specific product
  "problem": string,            // the real problem this idea solves, specific to the domain
  "audience": string,           // who specifically uses it and why
  "features": string[],         // exactly 5 concrete, domain-specific features
  "architecture": string[],     // exactly 5 concrete tech/architecture choices appropriate to the domain
  "screens": string[],          // exactly 5 concrete screens/pages the app needs
  "nextSteps": string[]         // exactly 3 actionable next steps
}`;

function userPrompt(input: GenerateInput): string {
  const kind =
    input.source === "url"
      ? "a linked source/URL"
      : input.source === "upload"
        ? "an uploaded brief"
        : "a written idea";
  return `Project idea (from ${kind}):
"""
${input.idea?.trim() || input.title}
"""
Short title: ${input.title}

Produce the JSON plan now. Make every feature, architecture choice, and screen
specific to THIS idea and its domain. If the idea mentions a technology
(e.g. quantum, IoT, computer vision, blockchain, ML), reflect the right tools
and components for it.`;
}

function extractJson(text: string): Record<string, unknown> | null {
  if (!text) return null;
  let t = text.trim();
  // Strip code fences if a model wrapped the JSON.
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(t.slice(start, end + 1));
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function callOpenAI(input: GenerateInput): Promise<Record<string, unknown> | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const controller = AbortSignal.timeout(25000);
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: controller,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt(input) },
      ],
    }),
  });
  if (!res.ok) {
    console.error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return null;
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return extractJson(data.choices?.[0]?.message?.content ?? "");
}

async function callGemini(input: GenerateInput): Promise<Record<string, unknown> | null> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(25000),
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userPrompt(input) }] }],
      generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) {
    console.error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return null;
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  return extractJson(text);
}

// Tries OpenAI, then Gemini, then the idea-aware local generator. Never throws.
async function generate(input: GenerateInput): Promise<ProjectOutput> {
  const providers: Array<() => Promise<Record<string, unknown> | null>> = [
    () => callOpenAI(input),
    () => callGemini(input),
  ];
  for (const provider of providers) {
    try {
      const ai = await provider();
      if (ai) return buildFromAi(input.title, input.source, input.idea, ai);
    } catch (err) {
      console.error("AI provider failed:", err);
    }
  }
  return createProjectOutput(input.title, input.source, input.idea);
}

export const generateProjectFn = createServerFn({ method: "POST" })
  .inputValidator((data: GenerateInput) => ({
    title: String(data?.title ?? "").slice(0, 200),
    idea: String(data?.idea ?? "").slice(0, 6000),
    source: (data?.source ?? "idea") as GenerateInput["source"],
  }))
  .handler(async ({ data }): Promise<ProjectOutput> => generate(data));
