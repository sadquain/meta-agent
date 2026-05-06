import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "./components/JsonLd";
import { MetaAgentWorkspace } from "./components/studio/MetaAgentWorkspace";
import { RuntimeFallback } from "./components/studio/RuntimeFallback";
import { RuntimePanel } from "./components/studio/RuntimePanel";
import { StudioFallback } from "./components/studio/StudioFallback";
import { StudioHeader } from "./components/studio/StudioHeader";
import styles from "./app.module.css";
import { siteConfig } from "./lib/site";

export const metadata: Metadata = {
  title: "MetaAgent Studio | Groq-Powered AI Agent Orchestration",
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: siteConfig.url,
    description: siteConfig.description,
  };

  return (
    <main className={styles.appContainer}>
      <JsonLd data={jsonLd} />
      <div className={styles.animatedBg} aria-hidden="true" />

      <div className={styles.contentWrapper}>
        <StudioHeader />

        <section className={styles.shellIntro} aria-labelledby="overview-heading">
          <h2 id="overview-heading">Build and run composable AI agents</h2>
          <p>
            Create specialist agents, compose them into graph workflows, and
            watch each node stream live output while the system runs.
          </p>
        </section>

        <Suspense fallback={<RuntimeFallback />}>
          <RuntimePanel />
        </Suspense>

        <Suspense fallback={<StudioFallback />}>
          <MetaAgentWorkspace />
        </Suspense>
      </div>
    </main>
  );
}
