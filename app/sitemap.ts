import type { MetadataRoute } from "next";
import { featuredAgentSlugs, siteConfig } from "./lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const dynamicAgentRoutes: MetadataRoute.Sitemap = featuredAgentSlugs.map(
    (slug) => ({
      url: `${siteConfig.url}/agents/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );

  return [...staticRoutes, ...dynamicAgentRoutes];
}
