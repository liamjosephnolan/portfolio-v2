// @ts-check
import { defineConfig } from "astro/config";

// Test deploy on GitHub Pages as a project site. The user site
// (liamjosephnolan.github.io) has a custom domain, so this repo is served
// at https://liamjosephnolan.com/portfolio-v2/.
const base = "/portfolio-v2";

export default defineConfig({
  output: "static",
  site: "https://liamjosephnolan.com",
  base,
});
