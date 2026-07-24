# Blog

个人博客和项目展示

An Astro-powered personal website for writing, project showcases, and an about page.

Default GitHub Pages URL:

```text
https://shanghuayao.github.io/Blog/
```

## Local Development

```bash
npm install
npm run dev
```

## Add A Blog Post

Create a Markdown file in `src/content/blog`.

```md
---
title: "My New Post"
description: "A short summary"
pubDate: 2026-07-24
tags: ["note", "build"]
---

Write your post here.
```

## Add A Project

Create a Markdown file in `src/content/projects`.

```md
---
title: "Project Name"
description: "What it does"
year: "2026"
tags: ["Astro", "Design"]
repo: "https://github.com/yourname/project"
demo: "https://example.com"
featured: true
---

Write project details here.
```

## Deploy To GitHub Pages

1. Push this project to `https://github.com/shanghuayao/Blog.git`.
2. Open repository `Settings > Pages`.
3. Set source to `GitHub Actions`.
4. This project is already configured for `https://shanghuayao.github.io/Blog/`.
5. Optional: set repository variable `PUBLIC_SITE_URL` to `https://shanghuayao.github.io` and `PUBLIC_BASE_PATH` to `/Blog/`.

The included workflow in `.github/workflows/deploy.yml` builds and publishes the site automatically.

