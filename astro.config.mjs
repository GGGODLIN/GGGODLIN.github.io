import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://gggodlin.github.io',
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
