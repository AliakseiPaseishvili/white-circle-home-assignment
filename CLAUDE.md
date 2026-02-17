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
  app/           # Next.js App Router pages
public/          # Static assets
components.json  # shadcn/ui configuration
```

## shadcn/ui

Components are managed via the shadcn MCP server (`@shadcn` registry).
Add components with: `npx shadcn@latest add <component>`
