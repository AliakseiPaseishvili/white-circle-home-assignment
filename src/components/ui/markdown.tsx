import { FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

export const Markdown: FC<MarkdownProps> = ({ content, className }) => {
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
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};
