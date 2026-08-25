import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";

export default function ChatThread({
  conversation,
  messages,
  currentUserId,
  draft,
  onDraftChange,
  onSend,
  onClose,
  sending,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!conversation) {
    return (
      <section className="flex min-h-0 flex-1 flex-col bg-white">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <img src="/image/paw-pink.svg" alt="" className="h-16 w-16" />
          <p className="text-body-2 text-gray-400">Start a conversation!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-white">
      <header className="flex h-24 items-center justify-between border-b border-gray-100 px-10">
        <div className="flex items-center gap-3">
          <span className="relative size-12 overflow-hidden rounded-full bg-gray-200">
            {conversation.otherUser?.avatarUrl ? (
              <img
                src={conversation.otherUser.avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <img
                src="/icon/user.svg"
                alt=""
                className="absolute inset-3 size-6 object-contain"
              />
            )}
          </span>
          <h2 className="text-h4 text-black">
            {conversation.otherUser?.name || "User"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-12 items-center justify-center rounded-full"
          aria-label="Close conversation"
        >
          <img src="/icon/x.svg" alt="" className="size-6" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-10 py-8">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <img src="/image/paw-pink.svg" alt="" className="h-16 w-16" />
            <p className="text-body-2 text-gray-400">Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message}
              isMine={message.senderId === currentUserId}
              avatarUrl={conversation.otherUser?.avatarUrl}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        value={draft}
        onChange={onDraftChange}
        onSend={onSend}
        disabled={sending}
      />
    </section>
  );
}
