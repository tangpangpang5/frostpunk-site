// @ts-check
import { defineConfig } from 'astro/config';

// 静态输出，可直接部署到 Cloudflare Pages。
// site 里的 {{domain}} 是模板占位符，部署前替换（见 README-SITE.md）。
export default defineConfig({
  site: 'https://{{domain}}',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
    format: 'directory',
  },
  devToolbar: { enabled: false },
});
