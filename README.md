# MetaAgent Studio

MetaAgent Studio is a Next.js App Router application for creating, running, and orchestrating Groq-powered AI agents. It supports single-agent runs, sequential multi-agent orchestration, and a simple graph execution path.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Groq chat completions API
- Supabase for agent and run persistence
- Partial Prerendering through Next.js Cache Components

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

## Streaming and PPR

This project uses the App Router with `cacheComponents: true` in `next.config.ts`, which is the current Next.js 16 model for Partial Prerendering.

The home route keeps static content in `app/page.tsx` and streams dynamic sections through Suspense boundaries:

- `StudioHeader` and intro copy are static shell content.
- `RuntimePanel` calls `connection()` and is wrapped in Suspense so request-time runtime details stream after the static shell.
- `MetaAgentWorkspace` is isolated as a client island and wrapped with a meaningful fallback.
- `app/loading.tsx` provides a route-level instant loading state.

Pattern:

```tsx
<Suspense fallback={<RuntimeFallback />}>
  <RuntimePanel />
</Suspense>
```

Use this same pattern for future data-heavy server components that read cookies, headers, search params, databases, or uncached APIs.

## SEO Strategy

SEO is implemented through App Router metadata and metadata file conventions:

- `app/layout.tsx` defines site-wide metadata, title templates, robots defaults, and Open Graph defaults.
- `app/page.tsx` defines route metadata for the studio home page.
- `app/agents/[slug]/page.tsx` demonstrates dynamic metadata with `generateMetadata`.
- `app/sitemap.ts` generates static and dynamic sitemap entries.
- `app/robots.ts` allows public pages and blocks API routes from crawling.
- `JsonLd` renders sanitized JSON-LD with `<script type="application/ld+json">`.

Semantic HTML is used in the page shell with one `h1`, section-level `h2` headings, `main`, `header`, `section`, `aside`, and `article` elements.

## Folder Structure

```txt
app/
  agents/[slug]/page.tsx       Dynamic metadata example route
  api/                         Route Handlers for agent workflows
  components/
    JsonLd.tsx                 Structured data helper
    studio/                    Composable studio UI components
  lib/                         Groq, orchestration, graph, Supabase helpers
  loading.tsx                  Route-level loading fallback
  layout.tsx                   Root layout and global metadata
  page.tsx                     Server-rendered home shell
  robots.ts                    robots.txt generator
  sitemap.ts                   sitemap.xml generator
next.config.ts                 Cache Components / PPR configuration
```

## Component Architecture

The interactive studio is split into focused components:

- `MetaAgentWorkspace` owns client state and API interactions.
- `AgentCreator` renders the agent creation form.
- `AgentRunner` renders run/orchestration controls.
- `GraphStatus` renders graph progress.
- `OutputPanel` renders model output.
- `RuntimePanel` is a server component for streamed runtime information.

Keep future data fetching in server components when possible, then pass small typed props into client components that need interactivity.

## Deployment on Vercel

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Add the environment variables from the setup section.
4. Deploy with the default Next.js framework settings.

Vercel supports App Router streaming and PPR. Keep `NEXT_PUBLIC_SITE_URL` set to the production URL so metadata, sitemap, robots, and JSON-LD point at the canonical domain.

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```
