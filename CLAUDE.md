# CLAUDE.md

## Project Overview

Next.js 16 app with shadcn/ui, Tailwind CSS v4, and TypeScript.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui (registry: `@shadcn`)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **React**: 19

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
  app/                  # Next.js App Router — pages and API routes
    api/                # API route handlers (one folder per endpoint)
    (pages)/            # Page routes and layouts
  components/
    ui/                 # shadcn/ui primitives shared across the app
  features/             # One folder per product feature
    <feature>/
      components/       # UI components specific to this feature
        index.ts        # Barrel export
      hooks/            # Custom hooks for this feature
        index.ts        # Barrel export
      index.ts          # Public API of the feature
  lib/                  # Generic utilities (cn, etc.)
public/                 # Static assets
components.json         # shadcn/ui configuration
```

## Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| React component files | `PascalCase.tsx` | `ChatInput.tsx` |
| Hook files | `kebab-case.ts` prefixed with `use-` | `use-chat-input.ts` |
| Utility / helper files | `kebab-case.ts` | `format-date.ts` |
| Barrel exports | `index.ts` | `index.ts` |
| API routes | Next.js convention `route.ts` inside named folder | `api/chat/route.ts` |

## Conventions

- Each folder inside `features/` has its own `index.ts` barrel export.
- Components use `FC` type and arrow function syntax.
- Form hooks use `react-hook-form` with `@hookform/resolvers/yup` and `yup` schemas.
- Memoize callbacks with `useCallback` in components.

## shadcn/ui

Components are managed via the shadcn MCP server (`@shadcn` registry).
Add components with: `npx shadcn@latest add <component>`

## Environment Variables

| Variable        | Description                    |
|-----------------|--------------------------------|
| `CLAUDE_API_KEY` | Anthropic API key for the chat route |
