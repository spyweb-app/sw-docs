# SpyWeb Documentation

Documentation site for [SpyWeb](https://github.com/anomalyco/spyweb), built with [Starlight](https://starlight.astro.build) + [Astro](https://astro.build).

## Project Structure

```
.
├── public/                      # Static assets (favicon, etc.)
├── src/
│   ├── components/
│   │   └── Header.astro         # Custom navbar
│   ├── content.config.ts        # Content collection config
│   └── styles/
│       └── style.scss           # Custom styles
├── docs/                        # All Markdown documentation pages
│   ├── cli-and-operations/
│   ├── job-configuration/
│   ├── lua-scripting/
│   ├── hook-reference/
│   ├── advanced-features/
│   └── lua-globals/
├── astro.config.mjs
├── uno.config.ts
├── package.json
└── tsconfig.json
```

## Commands

All commands run from the project root (`sw-docs/`):

| Command         | Action                                      |
| :-------------- | :------------------------------------------ |
| `bun install`   | Installs dependencies                       |
| `bun run dev`   | Starts local dev server at `localhost:4321` |
| `bun run build` | Build production site to `./dist/`          |
| `bun run preview` | Preview production build locally          |
