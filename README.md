# Askma Quiz Library

Viral personality quiz collection for Askma marketing funnel.
Built with Astro 6 + TypeScript + Cloudflare Pages.

## Development

```bash
npm install
npm run dev          # Start dev server at http://localhost:4321
npm run build        # Build production output to dist/
npm run preview      # Preview production build locally
```

## Adding a New Quiz

1. Create `src/content/quizzes/[quiz-slug].json` following the schema
2. Run `npm run dev` to verify
3. Commit + push

## Tech Stack

- **Framework:** Astro 6.0.2
- **Language:** TypeScript (strict)
- **Content:** JSON files via content collections + Zod schema
- **Hosting:** Cloudflare Pages
- **Analytics:** Supabase (separate project from main app)

## Project Structure

```
src/
├── content/quizzes/    # Quiz content as JSON
├── content.config.ts   # Zod schema definitions
├── pages/              # Astro pages (file-based routing)
├── components/         # Reusable .astro components
├── lib/                # Pure TS utilities
└── styles/             # Global CSS
```
