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
  "The current solutions are too complex and fragmented, making it hard for users to achieve their goals efficiently.",
  "Users struggle with inefficient workflows and lack a centralized platform to manage their core tasks.",
  "There is a significant gap in the market for a streamlined, user-friendly approach to this specific challenge.",
  "Existing tools lack the necessary flexibility and modern user experience required by today's demanding users.",
  "Manual processes and outdated software are causing major bottlenecks and reducing overall productivity."
];

const AUDIENCES = [
  "Small business owners and freelancers who need an affordable, easy-to-use solution.",
  "Enterprise teams and managers looking for scalable, secure, and robust workflows.",
  "Tech-savvy early adopters and creators who value clean design and seamless integrations.",
  "Everyday consumers seeking a simplified, mobile-first experience for their daily tasks.",
  "Professionals and domain experts who require specialized tools without the steep learning curve."
];

const FEATURE_POOLS = [
  [
    "Intuitive dashboard with real-time data visualization",
    "Seamless third-party API integrations",
    "Automated reporting and data exports",
    "Customizable user profiles and preferences"
  ],
  [
    "Smart search and advanced filtering capabilities",
    "Collaborative workspace for team sharing",
    "Push notifications and instant alerts",
    "Secure authentication and role-based access control"
  ],
  [
    "Drag-and-drop interface for rapid configuration",
    "Offline mode with background synchronization",
    "Comprehensive analytics and usage tracking",
    "Interactive onboarding wizard for new users"
  ],
  [
    "AI-powered recommendations and insights",
    "Multi-platform support (web, mobile, desktop)",
    "Built-in chat and communication tools",
    "One-click deployment and sharing options"
  ]
];

const ARCHITECTURE_POOLS = [
  [
    "Frontend: React with Vite and Tailwind CSS for rapid UI development",
    "Backend: Node.js with Express for scalable API endpoints",
    "Database: PostgreSQL for reliable relational data storage",
    "Hosting: Vercel for frontend and Render for backend services"
  ],
  [
    "Frontend: Next.js with Server-Side Rendering for SEO optimization",
    "State Management: Zustand or Redux for predictable state",
    "Database: MongoDB for flexible document-based storage",
    "Authentication: NextAuth.js with OAuth providers"
  ],
  [
    "Frontend: Vue 3 or Svelte for lightweight, reactive components",
    "API Layer: GraphQL with Apollo Server for precise data fetching",
    "Caching: Redis for high-performance data retrieval",
    "Infrastructure: AWS Serverless stack (Lambda, API Gateway)"
  ],
  [
    "Frontend: React Native for cross-platform mobile support",
    "Backend as a Service: Supabase or Firebase for rapid backend deployment",
    "Storage: Cloud Storage buckets for user-generated content",
    "Analytics: PostHog or Mixpanel for event tracking"
  ]
];

const SCREENS_POOLS = [
  [
    "Landing Page: High-converting hero section with call-to-action",
    "Dashboard: Overview of key metrics and recent activity",
    "Settings: User account management and preferences",
    "Details View: In-depth information for selected items"
  ],
  [
    "Authentication: Login, register, and password recovery",
    "Main Feed: Infinite scrolling list of relevant content",
    "Profile: User portfolio and activity history",
    "Checkout/Pricing: Subscription options and payment flow"
  ],
  [
    "Onboarding: Step-by-step tutorial for new users",
    "Workspace: Main canvas or editor interface",
    "Analytics: Charts and graphs showing performance",
    "Notifications: History of alerts and messages"
  ],
  [
    "Home: Personalized content discovery and recommendations",
    "Search: Advanced query interface with filters",
    "Library: Saved collections and user-generated resources",
    "Admin Panel: System overview and moderation tools"
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
