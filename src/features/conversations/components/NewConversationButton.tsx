import { FC } from "react";
import Link from "next/link";
import { SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NewConversationButton: FC = () => {
  return (
    <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2">
      <Link href="/">
        <SquarePen />
        New conversation
      </Link>
    </Button>
  );
};
