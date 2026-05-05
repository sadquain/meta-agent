export const siteConfig = {
  name: "MetaAgent Studio",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://meta-agent.vercel.app",
  description:
    "Build, run, and orchestrate AI agents with Groq-powered workflows.",
  keywords: [
    "AI agents",
    "meta agent",
    "Groq",
    "multi-agent orchestration",
    "Next.js App Router",
  ],
};

export const featuredAgentSlugs = ["planner", "executor", "critic"];

export function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
