import { FC } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
  components?: Components;
}

const builtInComponents: Components = {
  table: ({ children }) => (
    <div className="my-4 w-full overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted/60">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-border">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="transition-colors hover:bg-muted/40">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2 text-left font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 text-muted-foreground">{children}</td>
  ),
  hr: () => <hr className="my-4 border-border" />,
};

export const Markdown: FC<MarkdownProps> = ({ content, className, components }) => {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        "prose-p:leading-relaxed prose-p:my-1",
        "prose-pre:bg-muted prose-pre:rounded prose-pre:p-3",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ ...builtInComponents, ...components }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
