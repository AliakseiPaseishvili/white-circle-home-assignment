"use client";

import { FC, useState, useCallback } from "react";
import { Markdown } from "@/components/ui/markdown";
import type { PiiMapping } from "../context/ChatContext";

// Matches tokens like [EMAIL_1], [NAME_2], [PHONE_3], etc.
const PII_SPLIT_RE = /(\[[A-Z_]+_\d+\])/g;
const PII_TOKEN_RE = /^\[[A-Z_]+_\d+\]$/;

type Props = {
  text: string;
  mapping: PiiMapping;
  className?: string;
};

// Wraps PII tokens in backticks so ReactMarkdown treats them as inline code,
// which we then intercept with a custom `code` component.
function preprocessText(text: string): string {
  return text.replace(PII_SPLIT_RE, "`$1`");
}

export const PiiText: FC<Props> = ({ text, mapping, className }) => {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const toggle = useCallback((key: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const hasPii = Object.keys(mapping).length > 0;

  return (
    <Markdown
      content={hasPii ? preprocessText(text) : text}
      className={className}
      components={
        hasPii
          ? {
              code: ({ children, className: codeClass }) => {
                const content = String(children).trim();
                // Only intercept un-fenced inline code that matches a PII token
                if (!codeClass && PII_TOKEN_RE.test(content)) {
                  const key = content.slice(1, -1); // e.g. "EMAIL_1"
                  const original = mapping[key];
                  if (original) {
                    const isRevealed = revealed.has(key);
                    const label = key.replace(/_\d+$/, ""); // e.g. "EMAIL"
                    return (
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        title={isRevealed ? "Click to mask" : "Click to reveal"}
                        className="mx-0.5 inline-flex cursor-pointer items-center rounded bg-yellow-100 px-1.5 py-0.5 font-mono text-xs font-medium text-yellow-800 transition-colors hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:hover:bg-yellow-900/60"
                      >
                        {isRevealed ? original : `[${label}]`}
                      </button>
                    );
                  }
                }
                return <code className={codeClass}>{children}</code>;
              },
            }
          : undefined
      }
    />
  );
};
