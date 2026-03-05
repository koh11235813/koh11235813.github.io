# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install Ruby dependencies
bundle install

# Build site to docs/ directory
bundle exec jekyll build

# Local development server (http://localhost:4000)
bundle exec jekyll serve
```

The site builds to `docs/` (configured in `_config.yml` as `destination: docs`). This directory is the GitHub Pages source and must be committed after building.

## Architecture

This is a Jekyll static site using the **jekyll-theme-chirpy ~7.3** theme, published to https://koh11235813.github.io.

### Key Directories

| Path | Purpose |
|------|---------|
| `_posts/` | Blog posts (Jekyll standard, `YYYY-MM-DD-title.md`) |
| `_tabs/` | Static pages (articles archive, etc.) |
| `_includes/` | Chirpy theme HTML component overrides |
| `_sass/` | SCSS overrides (fonts, themes) |
| `_data/origin/cors.yml` | External CDN resource definitions |
| `assets/` | Static assets (images, CSS, JS) |
| `docs/` | **Compiled output** — GitHub Pages source, must be committed |
| `Source/` | Staging area for articles (excluded from Jekyll build) |
| `Build/` | Pre-compiled HTML from Source/ (excluded from Jekyll build) |

### Theme Customizations

- **Font**: Noto Sans JP — configured in `_sass/abstracts/_variables.scss` and `assets/css/jekyll-theme-chirpy.scss`
- **Color themes**: `_sass/themes/_light.scss` (light) and `_sass/themes/_dark.scss` (dark)
- **External resources**: CDN URLs in `_data/origin/cors.yml`

## Content Workflow

### Adding a Blog Post

Create `_posts/YYYY-MM-DD-title.md` with frontmatter:

```yaml
---
title: Post Title
date: YYYY-MM-DD HH:MM:SS +0900
author: kinoko1943
layout: post
categories: [Category]
toc: true
comments: false
---
```

After writing, run `bundle exec jekyll build` and commit the updated `docs/`.

### Source/Build Pipeline

`Source/articles/` contains staging articles with `YYYYMMDD-title.md` naming. These are manually compiled to `Build/articles/` as HTML. Both directories are excluded from the Jekyll build (`_config.yml` exclude list).
