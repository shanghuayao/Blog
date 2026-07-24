import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { siteConfig } from "../site.config";

export async function GET(context) {
  const base = import.meta.env.BASE_URL;
  const posts = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: `${siteConfig.name} · ${siteConfig.rss.titleSuffix}`,
    description: siteConfig.rss.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `${base}blog/${post.slug}/`,
    })),
  });
}
