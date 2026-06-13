export type ProjectFile = {
  path: string;
  purpose: string;
  content: string;
};

export type ProjectOutput = {
  summary: string;
  problem: string;
  audience: string;
  features: string[];
  architecture: string[];
  screens: string[];
  files: ProjectFile[];
  nextSteps: string[];
};

const cleanTitle = (title: string) =>
  title
    .replace(/^https?:\/\//i, "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .slice(0, 80) || "New product idea";

const toPascal = (value: string) =>
  cleanTitle(value)
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("") || "GeneratedApp";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "with", "that", "this",
  "is", "are", "be", "it", "as", "by", "at", "from", "into", "your", "you", "we", "our",
  "app", "application", "system", "platform", "project", "idea", "build", "create", "make",
  "using", "based", "want", "need", "should", "can", "will", "which", "where", "when",
  "real", "time", "data", "user", "users", "use", "via", "about", "like", "etc",
]);

// Extracts the most meaningful words from the raw idea so the output references it.
function keywords(text: string, limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const raw of text.toLowerCase().match(/[a-z][a-z0-9+\-]{2,}/gi) ?? []) {
    const w = raw.toLowerCase();
    if (STOPWORDS.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, limit)
    .map(([w]) => w);
}

type Domain = {
  id: string;
  label: string;
  match: RegExp;
  stack: string[];
  feature: string;
  screen: string;
};

// Domain hints let the fallback pick relevant tech + screens instead of generic boilerplate.
const DOMAINS: Domain[] = [
  {
    id: "iot",
    label: "IoT / connected devices",
    match: /\b(iot|sensor|sensors|device|devices|embedded|esp32|arduino|raspberry|mqtt|telemetry|smart\s?home|wearable)\b/i,
    stack: [
      "Device layer: MQTT over TLS for sensor telemetry, with an edge gateway buffering readings when offline",
      "Ingestion: a streaming pipeline (e.g. EMQX / AWS IoT Core) writing into a time-series database (TimescaleDB or InfluxDB)",
    ],
    feature: "Live device fleet view with per-sensor status, last-seen timestamps, and threshold alerts",
    screen: "Device Map: geospatial / grid view of every connected sensor with live status and battery health",
  },
  {
    id: "quantum",
    label: "Quantum computing",
    match: /\b(quantum|qubit|qubits|qiskit|superposition|entanglement|annealing|qaoa|vqe)\b/i,
    stack: [
      "Quantum layer: Qiskit / Cirq circuits executed on a simulator, with an abstraction for swapping in real QPU backends (IBM Q, IonQ)",
      "Classical orchestration: a Python (FastAPI) service that compiles, queues, and post-processes circuit jobs",
    ],
    feature: "Circuit builder and job runner that submits to a simulator or real backend and visualizes measurement histograms",
    screen: "Circuit Lab: drag-and-drop gate editor with a live state-vector / probability-distribution preview",
  },
  {
    id: "traffic",
    label: "Traffic / mobility",
    match: /\b(traffic|vehicle|vehicles|transport|transit|route|routing|congestion|parking|fleet|gps|road|roads|mobility)\b/i,
    stack: [
      "Geospatial: PostGIS for road/segment data and Mapbox GL for rendering live conditions on a map",
      "Stream processing: Kafka + a sliding-window aggregator computing congestion scores per road segment",
    ],
    feature: "Live congestion heatmap with per-segment speed, incident overlays, and predicted travel times",
    screen: "Live Map: real-time traffic heatmap with incident pins, segment drill-down, and time-of-day playback",
  },
  {
    id: "ml",
    label: "ML / prediction",
    match: /\b(ml|machine\s?learning|model|models|predict|prediction|forecast|classif|detection|anomaly|neural|training|inference|recommendation)\b/i,
    stack: [
      "Model serving: a Python inference service (FastAPI + ONNX Runtime) behind a queue for batch and real-time scoring",
      "ML ops: experiment tracking and a feature store so models can be retrained and versioned on fresh data",
    ],
    feature: "Prediction panel that runs the trained model on new inputs and shows confidence scores and key drivers",
    screen: "Model Insights: prediction results, confidence bands, feature-importance charts, and drift monitoring",
  },
  {
    id: "vision",
    label: "Computer vision",
    match: /\b(image|images|vision|camera|cctv|video|detection|opencv|yolo|recognition|face|object)\b/i,
    stack: [
      "Vision pipeline: an inference worker running an object/feature detector (YOLO / a vision transformer) on incoming frames",
      "Media handling: object storage (S3) for frames/clips plus a CDN for fast review playback",
    ],
    feature: "Frame review tool with bounding-box overlays, detection confidence, and one-click flagging",
    screen: "Detection Review: annotated frame viewer with detection list, filters, and an audit queue",
  },
  {
    id: "blockchain",
    label: "Blockchain / web3",
    match: /\b(blockchain|crypto|web3|smart\s?contract|ethereum|solidity|wallet|token|nft|ledger|defi)\b/i,
    stack: [
      "Chain layer: Solidity contracts on an EVM chain, with ethers.js / wagmi for wallet connection and reads",
      "Indexing: a subgraph / event indexer so the UI can query on-chain activity without hitting the node per request",
    ],
    feature: "Wallet-connected dashboard showing on-chain activity, balances, and contract interactions",
    screen: "On-chain Activity: transaction history, contract calls, and token balances with explorer deep-links",
  },
  {
    id: "health",
    label: "Healthcare",
    match: /\b(health|healthcare|patient|patients|medical|clinic|hospital|diagnos|ehr|fhir|telemedicine)\b/i,
    stack: [
      "Compliance: a HIPAA-minded data layer with field-level encryption and full audit logging on patient records",
      "Interop: FHIR-shaped resources so records can exchange with existing EHR systems",
    ],
    feature: "Patient timeline that consolidates records, vitals, and visit history into one reviewable view",
    screen: "Patient Record: longitudinal health timeline with vitals charts, notes, and care-team messaging",
  },
  {
    id: "commerce",
    label: "Commerce / marketplace",
    match: /\b(shop|shopping|store|ecommerce|e-commerce|marketplace|cart|checkout|product|catalog|payment|payments|seller|buyer)\b/i,
    stack: [
      "Payments: Stripe for checkout, subscriptions, and seller payouts with webhook-driven order state",
      "Catalog: a search-indexed product service (PostgreSQL + a search engine) for fast browse and filtering",
    ],
    feature: "Catalog with search, filters, cart, and a secure Stripe-powered checkout flow",
    screen: "Storefront: searchable product grid with filters, product detail pages, and a streamlined checkout",
  },
  {
    id: "finance",
    label: "Finance / fintech",
    match: /\b(finance|fintech|bank|banking|invoice|invoicing|accounting|budget|expense|trading|portfolio|loan|tax)\b/i,
    stack: [
      "Ledger: a double-entry transaction store with immutable history and reconciliation jobs",
      "Integrations: bank/transaction aggregation (e.g. Plaid) feeding a categorization engine",
    ],
    feature: "Account overview with categorized transactions, balances over time, and budget vs. actual tracking",
    screen: "Finance Dashboard: cashflow charts, categorized transaction ledger, and budget progress",
  },
  {
    id: "education",
    label: "Education / learning",
    match: /\b(education|learning|learn|course|courses|student|students|quiz|exam|lms|tutor|classroom|lesson)\b/i,
    stack: [
      "Content model: courses → modules → lessons with progress tracking per learner",
      "Assessment: a quiz/grading engine with attempt history and spaced-repetition scheduling",
    ],
    feature: "Course player with lesson progress, quizzes, and a personalized review queue",
    screen: "Learning Hub: course catalog, lesson player, progress tracker, and quiz/results view",
  },
];

function detectDomains(text: string): Domain[] {
  const hits = DOMAINS.filter((d) => d.match.test(text));
  return hits.length ? hits.slice(0, 3) : [];
}

// Builds the three deterministic starter files from the (AI or fallback) plan.
function buildStarterFiles(
  name: string,
  componentName: string,
  sourceLabel: string,
  features: string[],
  architecture: string[],
  screens: string[],
): ProjectFile[] {
  return [
    {
      path: "README.md",
      purpose: "Explains the generated project in plain language",
      content: `# ${name}\n\nGenerated from a ${sourceLabel}.\n\n## What it does\n${features
        .map((f) => `- ${f}`)
        .join("\n")}\n\n## Architecture\n${architecture
        .map((a) => `- ${a}`)
        .join("\n")}\n\n## Next steps\n- Replace sample data with real inputs.\n- Wire the screens below to live services.\n- Deploy the frontend to Vercel.\n`,
    },
    {
      path: "src/App.tsx",
      purpose: "Main React screen for the generated prototype",
      content: `export default function ${componentName}() {\n  return (\n    <main className="app-shell">\n      <section className="hero">\n        <p className="eyebrow">Generated prototype</p>\n        <h1>${name}</h1>\n        <p>${features[0] ?? ""}</p>\n      </section>\n      <section className="panel">\n        <h2>Core features</h2>\n        <ul>\n${features
        .map((f) => `          <li>${f}</li>`)
        .join("\n")}\n        </ul>\n      </section>\n      <section className="panel">\n        <h2>Screens</h2>\n        <ul>\n${screens
        .map((s) => `          <li>${s}</li>`)
        .join("\n")}\n        </ul>\n      </section>\n    </main>\n  );\n}\n`,
    },
    {
      path: "src/project-plan.ts",
      purpose: "Structured product plan that other tools can consume",
      content: `export const projectPlan = ${JSON.stringify(
        { name, source: sourceLabel, features, architecture, screens },
        null,
        2,
      )};\n`,
    },
  ];
}

const BASE_STACK = [
  "Frontend: React (Vite) + Tailwind CSS for a fast, responsive UI",
  "API: a typed backend (Node/NestJS or Python/FastAPI) exposing REST/GraphQL endpoints",
  "Database: PostgreSQL with an ORM for typed, relational data access",
  "Auth: token-based auth with role-based access control",
  "Infra: Vercel for the frontend and a managed container/serverless host for the API",
];

// Idea-aware fallback generator. Used as an instant placeholder and whenever
// the AI providers are unavailable, so output always references the real topic.
export function assembleOutput(input: {
  name: string;
  sourceLabel: string;
  idea: string;
  ai?: Partial<Pick<ProjectOutput, "summary" | "problem" | "audience" | "features" | "architecture" | "screens" | "nextSteps">>;
}): ProjectOutput {
  const { name, sourceLabel, idea } = input;
  const componentName = toPascal(name);
  const ai = input.ai ?? {};

  const kws = keywords(`${name} ${idea}`);
  const topic = name;
  const focus = kws.slice(0, 4).join(", ") || topic;
  const domains = detectDomains(`${name} ${idea}`);
  const domainLabel = domains.length
    ? domains.map((d) => d.label).join(" + ")
    : "this product space";

  const fallbackFeatures = (() => {
    const f = domains.map((d) => d.feature);
    f.push(
      `Search and filtering across ${focus} so users can find what matters fast`,
      `A clear ${topic} dashboard summarizing current status and recent activity`,
      `Export and sharing (PDF / CSV / link) of the generated ${topic} output`,
      "Role-based access so teams can collaborate safely",
    );
    return Array.from(new Set(f)).slice(0, 5);
  })();

  const fallbackArchitecture = (() => {
    const a = domains.flatMap((d) => d.stack);
    for (const b of BASE_STACK) {
      if (a.length >= 5) break;
      a.push(b);
    }
    return Array.from(new Set(a)).slice(0, 5);
  })();

  const fallbackScreens = (() => {
    const s = domains.map((d) => d.screen);
    s.push(
      `Dashboard: the ${topic} home view with key metrics and quick actions`,
      `Detail View: deep-dive into a single ${kws[0] ?? "item"} with inline editing`,
      "Settings: accounts, integrations, API keys, and access control",
    );
    return Array.from(new Set(s)).slice(0, 5);
  })();

  const features = normalizeList(ai.features, fallbackFeatures, 5);
  const architecture = normalizeList(ai.architecture, fallbackArchitecture, 5);
  const screens = normalizeList(ai.screens, fallbackScreens, 5);

  const problem =
    cleanString(ai.problem) ||
    `Teams working on ${domainLabel} currently stitch together disconnected tools to handle ${focus}, which is slow, error-prone, and hard to keep in sync. "${truncate(idea, 160)}" describes exactly the kind of workflow that needs a single, purpose-built system instead of manual, scattered effort.`;

  const audience =
    cleanString(ai.audience) ||
    `People and teams who work directly with ${domainLabel}: the ones who need ${focus} to be reliable, visible, and fast. They value accuracy and a tool that maps to how they actually work rather than generic dashboards.`;

  const summary =
    cleanString(ai.summary) ||
    `${topic} is a build-ready plan generated from your ${sourceLabel}. It centers on ${domainLabel}, turning the idea "${truncate(idea, 140)}" into a concrete product: the core problem, who it serves, the main features, an implementation shape, the key screens, and starter files you can export immediately.`;

  const nextSteps = normalizeList(ai.nextSteps, [
    `Validate the ${topic} feature list against one real ${kws[0] ?? "use"} case end-to-end.`,
    "Stand up the data layer and one core screen first to prove the workflow.",
    "Add API keys (OpenAI / Gemini) in your Vercel project to enable richer AI generation.",
  ], 3);

  return {
    summary,
    problem,
    audience,
    features,
    architecture,
    screens,
    files: buildStarterFiles(name, componentName, sourceLabel, features, architecture, screens),
    nextSteps,
  };
}

function cleanString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function truncate(s: string, n: number): string {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

function normalizeList(value: unknown, fallback: string[], count: number): string[] {
  const arr = Array.isArray(value)
    ? value.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean)
    : [];
  const out = arr.length ? arr : fallback;
  const filled = [...out];
  for (const f of fallback) {
    if (filled.length >= count) break;
    if (!filled.includes(f)) filled.push(f);
  }
  return filled.slice(0, count);
}

const sourceLabelOf = (source: "upload" | "idea" | "url") =>
  source === "upload" ? "uploaded document" : source === "url" ? "linked source" : "written idea";

export function createProjectOutput(
  title: string,
  source: "upload" | "idea" | "url",
  idea = "",
): ProjectOutput {
  const name = cleanTitle(title);
  return assembleOutput({
    name,
    sourceLabel: sourceLabelOf(source),
    idea: idea || title,
  });
}

export function getProjectOutput(input: {
  title: string;
  source: "upload" | "idea" | "url";
  idea?: string;
  output?: ProjectOutput;
}) {
  return input.output ?? createProjectOutput(input.title, input.source, input.idea);
}

// Used by the server AI function to merge model output with deterministic files + validation.
export function buildFromAi(
  title: string,
  source: "upload" | "idea" | "url",
  idea: string,
  ai: Record<string, unknown>,
): ProjectOutput {
  return assembleOutput({
    name: cleanTitle(title),
    sourceLabel: sourceLabelOf(source),
    idea: idea || title,
    ai: {
      summary: cleanString(ai.summary),
      problem: cleanString(ai.problem),
      audience: cleanString(ai.audience),
      features: Array.isArray(ai.features) ? (ai.features as string[]) : undefined,
      architecture: Array.isArray(ai.architecture) ? (ai.architecture as string[]) : undefined,
      screens: Array.isArray(ai.screens) ? (ai.screens as string[]) : undefined,
      nextSteps: Array.isArray(ai.nextSteps) ? (ai.nextSteps as string[]) : undefined,
    },
  });
}

export function renderMarkdown(title: string, output: ProjectOutput, id?: string, status?: string) {
  return [
    `# ${cleanTitle(title)}`,
    "",
    id ? `Project ID: ${id}` : "",
    status ? `Status: ${status}` : "",
    "",
    "## Summary",
    output.summary,
    "",
    "## Problem",
    output.problem,
    "",
    "## Audience",
    output.audience,
    "",
    "## Core Features",
    ...output.features.map((item) => `- ${item}`),
    "",
    "## App Structure",
    ...output.architecture.map((item) => `- ${item}`),
    "",
    "## Screens",
    ...output.screens.map((item) => `- ${item}`),
    "",
    "## Starter Files",
    ...output.files.flatMap((file) => [
      `### ${file.path}`,
      file.purpose,
      "```",
      file.content.trim(),
      "```",
      "",
    ]),
    "## Next Steps",
    ...output.nextSteps.map((item) => `- ${item}`),
    "",
  ]
    .filter((line, index, arr) => line !== "" || arr[index - 1] !== "")
    .join("\n");
}
