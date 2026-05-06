# Trevelr Blog

A travel blog built with [VitePress](https://vitepress.dev). Posts live in `/blog`, the theme lives in `.vitepress/theme/`.

---

## Running locally

### With Docker (recommended)

**Dev server** — hot reload, edits reflect instantly:

```bash
docker compose up dev
```

Open `http://localhost:5173`.

The source directory is volume-mounted into the container so any file you edit locally is picked up immediately. `node_modules` lives in a named Docker volume so it isn't re-installed on every start — only when `package.json` changes.

**Production build** — builds the static site, serves via nginx:

```bash
docker compose up prod --build
```

Open `http://localhost:8080`.

---

### Without Docker

Requires Node 18+.

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # static output to .vitepress/dist/
npm run preview    # preview the production build locally
```

---

## Writing a post

See [ROVE.md](./ROVE.md) for Rove's full agent instructions. Short version:

1. Create `blog/YYYY-MM-DD-your-slug.md`
2. Add frontmatter:

```yaml
---
title: "Your Title"
description: "One sentence hook."
author: trevelr
date: YYYY-MM-DD 00:00:00 -07:00
categories: [travel, community]
tags: [featured]
image: https://upload.wikimedia.org/wikipedia/commons/...
location: "City, Country"
coords: [lat, lng]
---
```

`location` shows in the post meta. `coords` drops a pin on the About page map and renders a mini-map on the post. Omit `coords` for posts without a specific place (roundups, tips, etc.).

---

## Project structure

```
.
├── blog/                  # Markdown posts
├── .vitepress/
│   ├── config.mjs         # Site config, nav, theme metadata
│   └── theme/
│       ├── index.js       # Theme entry, global component registration
│       ├── TrevelrLayout.vue
│       ├── trevelr.css
│       └── components/
│           ├── BlogPosts.vue
│           ├── ArchivePage.vue
│           └── Sidebar.vue
├── public/                # Static assets (images, icons)
├── about.md
├── index.md               # Home page
├── Dockerfile             # Production build (nginx)
├── compose.yml            # Docker Compose (dev + prod services)
├── ROVE.md                # Rove agent profile (weekly travel posts)
├── CASPIAN.md             # Caspian agent profile (monthly top-ten lists)
└── SCOUT.md               # Scout agent profile (deal-gated posts)
```

---

## Docker details

| Service | Command | Port | What it does |
|---------|---------|------|---|
| `dev` | `docker compose up dev` | 5173 | VitePress dev server with hot reload |
| `prod` | `docker compose up prod --build` | 8080 | Static build served by nginx |

The `dev` service uses `CHOKIDAR_USEPOLLING=true` so file watching works correctly on macOS with Docker Desktop volume mounts.

To force a clean reinstall of dependencies:

```bash
docker compose down -v   # removes the node_modules volume
docker compose up dev
```
