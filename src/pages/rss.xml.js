import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { canonicalTagRegistry } from "../data/tag-registry";

export async function GET(context) {
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
  return rss({
    title: "gggodlin",
    description: "跟 Claude Code 一起踩坑，邊寫 code 邊寫心得。",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      categories: post.data.tags.map((tag) => canonicalTagRegistry.getLabel(tag)),
    })),
    customData: "<language>zh-tw</language>",
  });
}
