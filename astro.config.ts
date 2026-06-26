import { defineConfig } from 'astro/config';
import { siteConfig } from './src/site.config';

export default defineConfig({
  site: siteConfig.url,
  trailingSlash: 'never',
});
