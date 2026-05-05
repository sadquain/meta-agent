import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "../../components/JsonLd";
import { siteConfig, titleFromSlug } from "../../lib/site";

type AgentPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: AgentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = titleFromSlug(slug);
  const title = `${name} Agent`;
  const description = `Explore the ${name} agent pattern for composable Groq-powered workflows.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/agents/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/agents/${slug}`,
      type: "article",
    },
  };
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { slug } = await params;
  const name = titleFromSlug(slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${name} Agent`,
    description: `A reusable ${name} agent role for multi-agent orchestration.`,
    url: `${siteConfig.url}/agents/${slug}`,
  };

  return (
    <main>
      <JsonLd data={jsonLd} />
      <article>
        <nav aria-label="Breadcrumb">
          <Link href="/">MetaAgent Studio</Link>
        </nav>
        <h1>{name} Agent</h1>
        <p>
          This route demonstrates dynamic Metadata API usage from App Router
          params while keeping the page semantic and indexable.
        </p>
        <h2>Role</h2>
        <p>
          Use this agent as a composable workflow role when splitting complex
          tasks into planning, execution, review, or graph nodes.
        </p>
      </article>
    </main>
  );
}
