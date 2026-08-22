import type { MetadataRoute } from "next";

const BASE_URL = "https://runnersleague.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Sign-in-gated pages show only a generic prompt to crawlers, and
      // /settings, /admin, /api, /login aren't content worth indexing.
      disallow: ["/settings/", "/admin/", "/api/", "/login", "/gear", "/community", "/playlist", "/rankings"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
