import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// BlogPost.astro renders <h1> from frontmatter title so optional blocks (e.g. TL;DR)
// can sit directly beneath the title while markdown files keep their standalone H1.
function remarkStripLeadingH1() {
  return (tree) => {
    const first = tree.children?.[0];
    if (first && first.type === 'heading' && first.depth === 1) {
      tree.children.shift();
    }
  };
}

export default defineConfig({
  site: 'https://blog.gggodlin.com',
  server: {
    host: true,
  },
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkStripLeadingH1],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
      wrap: true,
    },
  },
});
