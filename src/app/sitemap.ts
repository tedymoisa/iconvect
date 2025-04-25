import { siteConfig } from "@/site-config";
import { type MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0
    },
    {
      url: `${siteConfig.url}/prices`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8
    }
  ];

  return staticRoutes;
}
