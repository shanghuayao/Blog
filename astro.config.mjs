import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://shanghuayao.github.io",
  base: process.env.PUBLIC_BASE_PATH || "/Blog/",
});
