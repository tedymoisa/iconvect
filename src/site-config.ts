export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter?: string;
    github?: string;
  };
  keywords?: string[];
}

export const siteConfig: SiteConfig = {
  name: "IconVect",
  description:
    "Generate stunning, unique vector icons instantly using the power of AI. Create scalable SVG assets for your projects in seconds.",
  url: "https://iconvect.com",
  ogImage: "/seo-cover.png",
  links: {
    github: "https://github.com/project-kt/iconvect"
  },
  keywords: ["AI", "SVG", "vector", "icons", "generator", "graphics", "design", "AI generator", "library", "image"]
};

export type SiteConfigType = typeof siteConfig;
