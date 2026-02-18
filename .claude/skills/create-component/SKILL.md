---
name: create-component
description: Scaffolds a new React component with correct file placement, typing (FC), named exports, and barrel updates following project conventions. Trigger this skill whenever the user asks to add, create, or build a new component.Invoke with: /create-component <ComponentName> in <feature|ui> [optional description]
---

Create a React component following the project conventions below.

## Location rules

- Feature component → `src/features/<feature>/components/<ComponentName>.tsx`
- Shared UI primitive → `src/components/ui/<ComponentName>.tsx`

## Component rules

- Add `"use client"` at the top **only** if the component uses hooks, event handlers, or browser APIs
- Import order: React → external libs → `@/` aliases → relative `../`
- Type with `FC` from React: `export const Foo: FC<FooProps> = ({ ... }) => { ... }`
- Define props with `interface <ComponentName>Props` above the component
- Use `cn()` from `@/lib/utils` to merge Tailwind classes
- Use shadcn/ui primitives from `@/components/ui/` — install missing ones with `npx shadcn@latest add <name>`
- Wrap event callbacks in `useCallback`
- Named export only — no default exports

## File naming

- Component file: `PascalCase.tsx`  →  `ChatInput.tsx`
- Hook file: `use-kebab-case.ts`   →  `use-chat-input.ts`

## After creating the component file, always update barrels

- `src/features/<feature>/components/index.ts` — add named export
- `src/features/<feature>/index.ts` — ensure it re-exports from `./components`

## Minimal example

```tsx
"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";

interface ExampleCardProps {
  title: string;
  className?: string;
}

export const ExampleCard: FC<ExampleCardProps> = ({ title, className }) => {
  return (
    <div className={cn("rounded-md border p-4", className)}>
      <p>{title}</p>
    </div>
  );
};
```

## Form component example

```tsx
"use client";

import { FC, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMyHook, type MyValues } from "../hooks";

interface MyFormProps {
  onSubmit?: (values: MyValues) => void;
  isLoading?: boolean;
}

export const MyForm: FC<MyFormProps> = ({ onSubmit, isLoading }) => {
  const { form, handleSubmit } = useMyHook(onSubmit);
  const { register, formState: { errors, isValid } } = form;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        {...register("field")}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        aria-invalid={!!errors.field}
      />
      {errors.field && (
        <p className="text-xs text-destructive">{errors.field.message}</p>
      )}
      <Button type="submit" disabled={!isValid || isLoading} className="self-end">
        {isLoading ? "Loading..." : "Submit"}
      </Button>
    </form>
  );
};
```

## Task

$ARGUMENTS

Create the component described above. Follow all rules and examples strictly. After creating the file, update the relevant `index.ts` barrel exports.
