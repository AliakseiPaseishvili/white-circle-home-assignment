import { ConversationChat } from "@/features/conversations";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;

  return <ConversationChat conversationId={id} />;
}
