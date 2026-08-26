"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ConversationList from "@/components/chat/ConversationList";
import ChatThread from "@/components/chat/ChatThread";
import { getToken, getUser } from "@/lib/auth";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "@/lib/api";
import { useChatRealtime } from "@/lib/useChatRealtime";

function sameId(a, b) {
  return a != null && b != null && String(a) === String(b);
}

function MessagesFallback() {
  return (
    <div className="flex h-full items-center justify-center text-body-2 text-gray-400">
      Loading messages...
    </div>
  );
}

function MessagesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("id");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const currentUserId = getUser()?.id ?? null;
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const activeConversation = useMemo(
    () => conversations.find((item) => sameId(item.id, activeId)) ?? null,
    [conversations, activeId],
  );

  const loadConversations = useCallback(async () => {
    const data = await getConversations();
    setConversations(data);
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        await loadConversations();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load messages");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [loadConversations, router]);

  useEffect(() => {
    if (!activeId || !getToken()) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    async function loadThread() {
      try {
        await loadConversations();
        const data = await getMessages(activeId);
        if (!cancelled) {
          setMessages(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load chat");
        }
      }
    }

    loadThread();
    return () => {
      cancelled = true;
    };
  }, [activeId, loadConversations]);

  const handleRealtimeEvent = useCallback(
    (event) => {
      loadConversations().catch(() => {});

      const currentId = activeIdRef.current;
      if (!currentId) return;

      if (
        event.conversationId &&
        !sameId(event.conversationId, currentId) &&
        event.type !== "refresh"
      ) {
        return;
      }

      getMessages(currentId)
        .then((data) => {
          setMessages(data);
          setError("");
        })
        .catch(() => {});
    },
    [loadConversations],
  );

  useChatRealtime({
    enabled: true,
    onEvent: handleRealtimeEvent,
  });

  function selectConversation(id) {
    router.replace(`/messages?id=${id}`);
  }

  function closeConversation() {
    router.replace("/messages");
    setDraft("");
  }

  async function handleSend({ imageFile } = {}) {
    if (!activeId || sending) return false;

    const text = draft.trim();
    if (!text && !imageFile) return false;

    setSending(true);
    setError("");
    try {
      const created = await sendMessage(activeId, {
        content: text,
        imageFile,
      });
      setMessages((current) => [...current, created]);
      setDraft("");
      await loadConversations();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      return false;
    } finally {
      setSending(false);
    }
  }

  if (loading) return <MessagesFallback />;

  return (
    <div className="flex h-full min-h-0 flex-1">
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onBack={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
          }
          router.push(getUser()?.isSitter ? "/sitter/profile" : "/");
        }}
      />
      <div
        className={`min-w-0 flex-1 flex-col ${
          activeId ? "flex" : "hidden md:flex"
        }`}
      >
        {error ? (
          <p className="border-b border-red-light bg-red-light px-4 py-3 text-body-3 text-red md:px-10">
            {error}
          </p>
        ) : null}
        <ChatThread
          conversation={activeConversation}
          messages={messages}
          currentUserId={currentUserId}
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          onClose={closeConversation}
          sending={sending}
        />
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesFallback />}>
      <MessagesView />
    </Suspense>
  );
}
