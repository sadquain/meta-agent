# MetaAgent Studio

MetaAgent Studio is a Next.js App Router application for creating, running,
visualizing, and orchestrating Groq-powered AI agents. It lets users build
specialized agents, connect them into graph workflows, stream live execution
output, and persist generated agents and runs with Supabase.

In practical terms, MetaAgent Studio is a workspace for building small AI teams.
Instead of relying on one generic chatbot, users can create agents such as a
planner, executor, critic, researcher, or reviewer, then compose those agents
into sequential or graph-based workflows.

## Project Overview

MetaAgent Studio provides an interactive studio for:

- Generating AI agents from a natural language task description.
- Running a single agent against user input.
- Running multiple agents in sequence.
- Building visual node-and-edge agent graphs.
- Streaming graph execution output in real time.
- Highlighting the active node and active edge while a graph runs.
- Dynamically injecting new specialist agents through a Meta-Agent Generator.
- Saving generated agents and execution data with Supabase.

The application is built as a production-oriented prototype for experimenting
with multi-agent AI systems, graph execution, and runtime agent evolution.

## Purpose and Objectives

The project is being built to make multi-agent AI systems easier to design,
understand, and operate.

Single-chat interfaces are useful for simple prompts, but complex work often
benefits from multiple specialized roles. One agent may plan, another may
execute, another may critique, and another may refine the result. MetaAgent
Studio gives users a way to create and coordinate those roles through a clear
web interface.

The main objectives are:

- Make AI agent creation simple through natural language.
- Help users compose agents into reusable workflows.
- Provide visibility into what each agent does during execution.
- Support graph-based workflows instead of only linear chat.
- Enable bounded runtime agent generation through MAG.
- Stream live output so users can observe work as it happens.
- Persist useful agent and run data for later review.

For non-technical users, the goal is to make AI teams understandable and
usable. For technical users, the goal is to provide a clean foundation for
experimenting with orchestration, graph runtimes, and LLM streaming.

## Scope

Included features:

- Agent creation through `/api/mag`.
- Single-agent execution through `/api/run`.
- Sequential orchestration through `/api/orchestrate`.
- Graph execution through `/api/graph`.
- Streaming graph execution through `/api/graph/stream`.
- Visual Graph Builder UI.
- Native drag-and-drop graph nodes.
- Edge-based agent connections.
- Editable node IDs, names, and system prompts.
- Active-node highlighting during execution.
- Animated active-edge flow.
- Per-node live output and logs.
- Final graph output display.
- Self-evolving graph mode using MAG.
- Safeguards for graph execution, including bounded generated agents and max
  execution steps.
- Supabase-backed persistence for agents and runs.
- SEO metadata, sitemap, robots config, and JSON-LD.
- Next.js Cache Components / Partial Prerendering patterns.

Current boundaries:

- Groq is the LLM provider.
- Supabase is required for persistence.
- The graph builder uses native React state and browser drag/drop rather than a
  dedicated graph library.
- Dynamic agent creation is intentionally bounded to avoid runaway loops.
- The project is a studio/prototype platform, not a full enterprise workflow
  suite with teams, permissions, audit logs, billing, or workflow versioning.

## How It Works

MetaAgent Studio has three major layers:

1. Frontend Studio
2. Next.js API Routes
3. AI and Persistence Services

The frontend studio lets users create agents, enter tasks, connect graph nodes,
run workflows, and inspect output. The API layer receives requests from the UI,
calls Groq for LLM responses, and stores relevant records in Supabase. The core
library modules contain the agent, orchestration, graph, MAG, Groq, and Supabase
logic.

### Agent Creation Flow

1. A user enters a task description.
2. The frontend sends the task to `/api/mag`.
3. MAG asks Groq to return a structured JSON agent definition.
4. The generated agent includes `name`, `role`, `systemPrompt`, and
   `constraints`.
5. The API route stores the generated agent in Supabase.
6. The UI displays the created agent configuration.

### Single Agent Flow

1. A user enters execution input.
2. The frontend sends the selected agent and input to `/api/run`.
3. The server combines the agent system prompt with the user input.
4. Groq returns the agent output.
5. The run is saved and shown in the UI.

### Sequential Orchestration Flow

1. A user submits input to a predefined multi-agent system.
2. The planner receives the original input.
3. The executor receives the planner output.
4. The critic receives the executor output.
5. The final response and intermediate logs are returned to the UI.

### Visual Graph Execution Flow

1. A user builds or edits graph nodes in the Visual Graph Builder.
2. Each node represents an AI agent.
3. Edges define execution order.
4. The frontend calls `/api/graph/stream`.
5. The backend executes the graph node by node.
6. Token chunks stream back to the browser.
7. The UI highlights the active node and animates the active edge.
8. Per-node logs and final output are displayed.

### Self-Evolving Graph Flow

When self-evolving mode is enabled:

1. The graph begins with the Meta-Agent node.
2. MAG analyzes the current task.
3. MAG proposes missing specialist agents.
4. The backend injects those agents into the graph.
5. The graph continues execution with the newly generated nodes.
6. Runtime safeguards limit graph expansion and execution depth.

## Key Components

### Frontend Components

- `MetaAgentWorkspace` owns studio state and API interactions.
- `AgentCreator` renders the agent creation form.
- `AgentRunner` renders single-agent, orchestration, and graph controls.
- `VisualGraphBuilder` provides the drag-and-drop graph UI, node editing,
  streamed execution display, and logs.
- `GraphStatus` renders graph progress feedback.
- `OutputPanel` renders model output.
- `RuntimePanel` streams request-time runtime information through Suspense.
- `JsonLd` renders structured metadata.

### API Routes

- `/api/mag` creates and stores generated agents.
- `/api/run` executes a single agent and stores a run.
- `/api/orchestrate` runs sequential multi-agent workflows.
- `/api/graph` runs a basic graph workflow.
- `/api/graph/stream` streams graph execution events.
- `/api/workflow` runs workflow helpers.
- `/api/feedback` updates run feedback and edited output.

### Library Modules

- `app/lib/groq.ts` wraps Groq chat completions and streaming responses.
- `app/lib/mag.ts` implements the Meta-Agent Generator.
- `app/lib/agent.ts` runs a single agent prompt.
- `app/lib/orchestrator.ts` runs agents sequentially.
- `app/lib/graph.ts` executes graph workflows and streaming graph events.
- `app/lib/supabase.ts` creates the Supabase client.
- `app/lib/rules.ts` contains output validation helpers.
- `app/lib/site.ts` centralizes site metadata.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Groq chat completions API
- Supabase for agent and run persistence
- CSS Modules
- Tailwind CSS runtime setup
- Partial Prerendering through Next.js Cache Components

## Use Cases

MetaAgent Studio can be used by:

- Product teams prototyping AI workflows.
- Developers experimenting with agent orchestration.
- Founders building AI product demos.
- Researchers exploring graph-based LLM systems.
- Content teams building planner, writer, editor, and reviewer agents.
- Support teams designing triage and response workflows.
- Technical teams testing streaming multi-agent execution.

Example scenarios:

- Create an AI team that plans, writes, edits, and reviews a blog post.
- Build a debugging workflow with analyzer, fixer, and test-writer agents.
- Generate task-specific agents dynamically during graph execution.
- Visualize how output moves from one agent to another.
- Compare single-agent output against multi-agent output.

## Expected Outcomes

MetaAgent Studio is designed to help users:

- Create specialized AI agents faster.
- Understand how multi-agent systems behave.
- Debug agent workflows through visible intermediate output.
- Build modular AI workflows instead of one-off prompts.
- Experiment with graph-based orchestration.
- Observe live streamed execution.
- Persist useful agent and run records.
- Move from single chatbot interactions toward coordinated AI systems.

The expected impact is a clearer and more practical way to design AI workflows
that act like teams of specialized agents rather than isolated prompts.

## Streaming and Partial Prerendering

This project uses the App Router with `cacheComponents: true` in
`next.config.ts`, which is the current Next.js 16 model for Partial
Prerendering.

The home route keeps static content in `app/page.tsx` and streams dynamic
sections through Suspense boundaries:

- `StudioHeader` and intro copy are static shell content.
- `RuntimePanel` calls `connection()` and is wrapped in Suspense so
  request-time runtime details stream after the static shell.
- `MetaAgentWorkspace` is isolated as a client island and wrapped with a
  fallback.
- `app/loading.tsx` provides a route-level instant loading state.

Pattern:

```tsx
<Suspense fallback={<RuntimeFallback />}>
  <RuntimePanel />
</Suspense>
```

Use this same pattern for future data-heavy server components that read cookies,
headers, search params, databases, or uncached APIs.

## SEO Strategy

SEO is implemented through App Router metadata and metadata file conventions:

- `app/layout.tsx` defines site-wide metadata, title templates, robots defaults,
  and Open Graph defaults.
- `app/page.tsx` defines route metadata for the studio home page.
- `app/agents/[slug]/page.tsx` demonstrates dynamic metadata with
  `generateMetadata`.
- `app/sitemap.ts` generates static and dynamic sitemap entries.
- `app/robots.ts` allows public pages and blocks API routes from crawling.
- `JsonLd` renders sanitized JSON-LD with
  `<script type="application/ld+json">`.

Semantic HTML is used in the page shell with `main`, `header`, `section`,
`aside`, and `article` elements.

## Folder Structure

```txt
app/
  agents/[slug]/page.tsx       Dynamic metadata example route
  api/                         Route Handlers for agent workflows
    graph/stream/route.ts      Streaming graph execution endpoint
  components/
    JsonLd.tsx                 Structured data helper
    studio/                    Composable studio UI components
  lib/                         Groq, MAG, orchestration, graph, Supabase helpers
  loading.tsx                  Route-level loading fallback
  layout.tsx                   Root layout and global metadata
  page.tsx                     Server-rendered home shell
  robots.ts                    robots.txt generator
  sitemap.ts                   sitemap.xml generator
next.config.ts                 Cache Components / PPR configuration
```

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Required variables:

```bash
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deployment on Vercel

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Add the required environment variables in Project Settings.
4. Redeploy after adding or changing environment variables.
5. Deploy with the default Next.js framework settings.

Vercel supports App Router streaming and Partial Prerendering. Keep
`NEXT_PUBLIC_SITE_URL` set to the production URL so metadata, sitemap, robots,
and JSON-LD point at the canonical domain.

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npx tsc --noEmit
```
