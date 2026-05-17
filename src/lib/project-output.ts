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

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const PROBLEMS = [
  "Traditional solutions rely on fragmented toolchains and outdated legacy systems, resulting in immense cognitive overhead and workflow friction. Teams lose hours context-switching between disjointed applications, leading to data silos, miscommunication, and severely reduced time-to-market. There is a desperate need for a unified, high-performance ecosystem that centralizes operations and respects the user's focus.",
  "The current market offerings are either overly simplistic, lacking the necessary depth for power users, or excessively bloated, alienating everyday consumers. This polarization leaves a massive segment of the market unserved: users who require robust, enterprise-grade capabilities wrapped in an intuitive, consumer-grade user interface. The friction in onboarding and daily usage remains a critical bottleneck for adoption.",
  "Data fragmentation and lack of real-time synchronization cripple decision-making. Users are forced to make high-stakes choices based on stale or incomplete information scattered across multiple platforms. The absence of a single source of truth not only leads to costly errors but also prevents organizations from leveraging predictive analytics and machine learning to proactively address their challenges.",
  "Security and compliance concerns have traditionally stifled innovation in this space, forcing users to rely on slow, highly-restrictive legacy portals. The challenge is balancing airtight, zero-trust security architecture with a frictionless, modern user experience. Currently, users are paying a heavy tax in productivity to maintain compliance, leading to shadow IT and compromised security postures.",
  "Manual, repetitive tasks consume a disproportionate amount of human capital, stifling creativity and strategic thinking. Existing automation tools are often too rigid, requiring significant engineering resources to set up and maintain. Users need a solution that democratizes automation, allowing non-technical stakeholders to build intelligent workflows that adapt dynamically to their changing needs."
];

const AUDIENCES = [
  "Visionary founders, early-stage startups, and agile product teams who demand rapid iteration, high-performance tooling, and an uncompromising aesthetic standard. They value speed, modularity, and systems that scale effortlessly as they find product-market fit.",
  "Forward-thinking enterprise leaders, CTOs, and operations managers operating in complex, heavily regulated environments. They require unparalleled security, comprehensive audit trails, and seamless integration with existing legacy infrastructure without sacrificing modern UX.",
  "Digital creators, independent professionals, and the gig-economy workforce who treat their software as an extension of their craft. They have high expectations for design fidelity, mobile accessibility, and tools that instantly map to their unique, non-linear creative processes.",
  "Data-driven analysts, researchers, and domain experts who need to extract actionable insights from massive, unstructured datasets. They prioritize robust filtering, advanced visualization capabilities, and the ability to run complex queries without relying on an engineering team.",
  "Everyday consumers and non-technical end-users who expect consumer-grade simplicity, zero onboarding friction, and instant gratification. They need a platform that abstracts away technical complexity and delivers immediate value from the very first interaction."
];

const FEATURE_POOLS = [
  [
    "Real-time, interactive command center with high-fidelity data visualization and customizable widget layouts",
    "Deep, bi-directional API integrations with industry-standard platforms (Slack, Jira, GitHub)",
    "Automated, intelligent reporting engine with scheduled delivery and zero-config export pipelines",
    "Granular, role-based access control (RBAC) with custom permission matrices and audit logging",
    "Predictive analytics module leveraging historical data to forecast trends and identify anomalies"
  ],
  [
    "Fuzzy-search engine with contextual awareness and instant, millisecond-latency results filtering",
    "Real-time collaborative canvas allowing multiple concurrent users with live cursor tracking",
    "Intelligent push notification routing engine to prevent alert fatigue and highlight critical events",
    "Zero-trust security architecture featuring biometric authentication and hardware-key support",
    "Automated workflow builder with a drag-and-drop node interface and custom webhook triggers"
  ],
  [
    "Visual, block-based editor enabling rapid, no-code configuration of complex business logic",
    "Robust offline-first architecture with conflict-free replicated data types (CRDTs) for seamless syncing",
    "Comprehensive behavioral analytics tracking with session replay and conversion funnel mapping",
    "Context-aware, interactive onboarding flow utilizing progressive disclosure to minimize cognitive load",
    "Extensible plugin ecosystem allowing third-party developers to build and distribute custom modules"
  ],
  [
    "Proprietary AI co-pilot providing contextual recommendations, code generation, and automated insights",
    "Native, fluid experiences across iOS, Android, and Desktop via a unified, high-performance codebase",
    "Integrated, low-latency communication layer supporting rich text, voice, and threaded conversations",
    "One-click deployment pipeline with automated staging environments and zero-downtime rollbacks",
    "Dynamic, algorithmic content feed optimized for user engagement and personalized discovery"
  ]
];

const ARCHITECTURE_POOLS = [
  [
    "Frontend: Next.js 14 with React Server Components (RSC) and Tailwind CSS for optimal edge delivery",
    "Backend: Go microservices orchestrated via Kubernetes for maximum throughput and low latency",
    "Database: PlanetScale (Serverless MySQL) for infinite horizontal scaling and branch-based schema management",
    "Infrastructure: Vercel for the presentation layer, AWS (EKS) for compute, and Cloudflare for edge security",
    "State: Zustand for lightweight client state, React Query for server state caching and invalidation"
  ],
  [
    "Frontend: React SPA powered by Vite, utilizing Framer Motion for highly fluid, 60fps micro-interactions",
    "Backend: Node.js (NestJS) providing a strongly-typed, modular, and testable API architecture",
    "Database: PostgreSQL with Prisma ORM for type-safe database interactions and complex relational queries",
    "Authentication: Clerk for secure, drop-in user management, MFA, and B2B organizational structures",
    "Caching: Redis cluster for session management, rate limiting, and sub-millisecond data retrieval"
  ],
  [
    "Frontend: SvelteKit offering a zero-JS-by-default approach, compiling away framework overhead",
    "API Layer: Apollo GraphQL federation, unifying multiple domain services into a single, cohesive graph",
    "Database: MongoDB Atlas for highly flexible, document-oriented storage accommodating rapid schema evolution",
    "Infrastructure: AWS Serverless stack (Lambda, API Gateway, DynamoDB) for true pay-per-use scaling",
    "Observability: Datadog for full-stack distributed tracing, log aggregation, and real-time anomaly detection"
  ],
  [
    "Frontend: React Native with Expo (New Architecture) delivering truly native performance on iOS and Android",
    "Backend as a Service (BaaS): Supabase providing instant Postgres APIs, real-time subscriptions, and edge functions",
    "Storage: AWS S3 with CloudFront CDN for lightning-fast, globally distributed media asset delivery",
    "Analytics: PostHog for open-source, privacy-compliant product analytics and feature flag management",
    "Payments: Stripe Billing integration for handling complex, tiered SaaS subscription models and usage-based pricing"
  ]
];

const SCREENS_POOLS = [
  [
    "Command Center: High-density, customizable dashboard featuring real-time telemetry and vital system metrics",
    "Global Search: Command-K interface (⌘+K) for instant, keyboard-driven navigation and action execution",
    "Resource Hub: Detailed, deeply-linked view for managing individual entities with inline editing capabilities",
    "Access Management: Granular control panel for defining roles, managing teams, and reviewing security logs",
    "Integration Registry: Marketplace interface for connecting and configuring third-party applications"
  ],
  [
    "Auth Gateway: Frictionless onboarding flow featuring social SSO, magic links, and biometric prompts",
    "The Feed: Infinite-scrolling, algorithmically curated stream of content with optimistic UI updates",
    "Creator Profile: Public-facing portfolio showcasing user activity, achievements, and curated collections",
    "Interactive Canvas: The core workspace where users create, edit, and manipulate their primary assets",
    "Billing Portal: Transparent subscription management, invoice history, and seat-based licensing controls"
  ],
  [
    "Welcome Wizard: Multi-step, personalized onboarding sequence designed to capture intent and tailor the experience",
    "Mission Control: Project management interface featuring Kanban boards, Gantt charts, and timeline views",
    "Analytics Deep-Dive: Comprehensive reporting suite with interactive charts, date-range pickers, and CSV exports",
    "Notification Center: Centralized inbox for system alerts, mentions, and actionable workflow requests",
    "Developer Settings: Advanced configuration area for generating API keys, configuring webhooks, and reviewing API logs"
  ],
  [
    "Discovery Engine: Personalized storefront or content directory utilizing machine learning for recommendations",
    "Advanced Filter Interface: Complex querying tool allowing users to combine multiple parameters and save custom views",
    "Media Library: Grid-based asset manager with drag-and-drop uploading, bulk actions, and metadata tagging",
    "Moderation Queue: Admin-facing interface for reviewing flagged content, managing user reports, and applying penalties",
    "System Status: Public-facing dashboard communicating uptime, ongoing incidents, and scheduled maintenance windows"
  ]
];

export function createProjectOutput(
  title: string,
  source: "upload" | "idea" | "url",
): ProjectOutput {
  const name = cleanTitle(title);
  const componentName = toPascal(name);
  const sourceLabel =
    source === "upload" ? "uploaded document" : source === "url" ? "linked source" : "written idea";

  const hash = hashString(title);
  
  const problem = PROBLEMS[hash % PROBLEMS.length];
  const audience = AUDIENCES[(hash >> 1) % AUDIENCES.length];
  const features = FEATURE_POOLS[(hash >> 2) % FEATURE_POOLS.length];
  const architecture = ARCHITECTURE_POOLS[(hash >> 3) % ARCHITECTURE_POOLS.length];
  const screens = SCREENS_POOLS[(hash >> 4) % SCREENS_POOLS.length];

  const files: ProjectFile[] = [
    {
      path: "README.md",
      purpose: "Explains the generated project in plain language",
      content: `# ${name}\n\nThis starter project was generated from a ${sourceLabel}.\n\n## What it does\n${features.map((f) => `- ${f}`).join("\n")}\n\n## Next steps\n- Replace sample data with real inputs.\n- Connect the generation layer to your preferred backend or AI provider.\n- Deploy the frontend to Vercel.\n`,
    },
    {
      path: "src/App.tsx",
      purpose: "Main React screen for the generated prototype",
      content: `export default function ${componentName}() {\n  return (\n    <main className="app-shell">\n      <section className="hero">\n        <p className="eyebrow">Generated prototype</p>\n        <h1>${name}</h1>\n        <p>${features[0]}</p>\n      </section>\n      <section className="panel">\n        <h2>Core features</h2>\n        <ul>\n${features.map((f) => `          <li>${f}</li>`).join("\n")}\n        </ul>\n      </section>\n    </main>\n  );\n}\n`,
    },
    {
      path: "src/project-plan.ts",
      purpose: "Structured product plan that other tools can consume",
      content: `export const projectPlan = ${JSON.stringify({ name, source: sourceLabel, features, architecture, screens }, null, 2)};\n`,
    },
  ];

  return {
    summary: `${name} is a build-ready prototype direction generated from your ${sourceLabel}. It defines the product purpose, expected screens, implementation shape, and starter files so you can inspect and export the work immediately.`,
    problem,
    audience,
    features,
    architecture,
    screens,
    files,
    nextSteps: [
      "Review the generated plan and adjust feature names for your real use case.",
      "Use the starter files export as the first implementation checklist.",
      "Connect a backend or AI provider when you want deeper source analysis.",
    ],
  };
}

export function getProjectOutput(input: {
  title: string;
  source: "upload" | "idea" | "url";
  output?: ProjectOutput;
}) {
  return input.output ?? createProjectOutput(input.title, input.source);
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
