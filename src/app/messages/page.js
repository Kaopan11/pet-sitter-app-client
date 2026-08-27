"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ConversationList from "@/components/chat/ConversationList";
import ChatThread from "@/components/chat/ChatThread";
import { getToken, getUser } from "@/lib/auth";
import {
  getConversations,
  getMessages,
  markConversationRead,
  sendMessage,
} from "@/lib/api";
import { useChatRealtime } from "@/lib/useChatRealtime";

function sameId(a, b) {
  return a != null && b != null && String(a) === String(b);
}

function previewFromSend(text, hasImage) {
  const content = String(text ?? "").trim();
  if (content) return content;
  if (hasImage) return "Sent a photo";
  return "";
}

function isSameOptimistic(pending, incoming) {
  if (!pending?.pending) return false;
  if (pending.replaceWithId && sameId(incoming.id, pending.replaceWithId)) {
    return true;
  }
  return (
    sameId(pending.senderId, incoming.senderId) &&
    String(pending.content ?? "").trim() === String(incoming.content ?? "").trim() &&
    Boolean(pending.imageUrl) === Boolean(incoming.imageUrl)
  );
}

function upsertMessage(current, incoming) {
  if (current.some((item) => sameId(item.id, incoming.id))) {
    return current.map((item) =>
      sameId(item.id, incoming.id)
        ? {
            ...incoming,
            pending: false,
            clientKey: item.clientKey ?? item.id,
          }
        : item,
    );
  }

  const pendingIndex = current.findIndex((item) => isSameOptimistic(item, incoming));
  if (pendingIndex >= 0) {
    const next = [...current];
    const pending = next[pendingIndex];
    next[pendingIndex] = {
      ...incoming,
      pending: false,
      clientKey: pending.clientKey ?? pending.id,
    };
    return next;
  }

  return [...current, incoming];
}

function mergeServerMessages(server, current, conversationId) {
  const leftover = current.filter(
    (item) =>
      item.pending &&
      sameId(item.conversationId, conversationId) &&
      !server.some((row) => isSameOptimistic(item, row)),
  );
  return [...server, ...leftover];
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
  const [error, setError] = useState("");
  const currentUserId = getUser()?.id ?? null;
  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const activeConversation = useMemo(
    () => conversations.find((item) => sameId(item.id, activeId)) ?? null,
    [conversations, activeId],
  );

  const loadConversations = useCallback(async () => {
    const data = await getConversations();
    const openId = activeIdRef.current;
    setConversations(
      openId
        ? data.map((item) =>
            sameId(item.id, openId) ? { ...item, unreadCount: 0 } : item,
          )
        : data,
    );
  }, []);

  function markConversationSeen(conversationId) {
    if (!conversationId) return;
    let hadUnread = false;
    setConversations((current) => {
      const target = current.find((item) => sameId(item.id, conversationId));
      hadUnread = Boolean(target && target.unreadCount > 0);
      if (!hadUnread) return current;
      return current.map((item) =>
        sameId(item.id, conversationId) ? { ...item, unreadCount: 0 } : item,
      );
    });
    if (hadUnread) {
      window.dispatchEvent(new CustomEvent("chat-unread-cleared"));
    }
  }

  function persistConversationRead(conversationId) {
    if (!conversationId) return;
    markConversationRead(conversationId).catch(() => {});
  }

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
    markConversationSeen(activeId);

    async function loadThread() {
      try {
        const data = await getMessages(activeId);
        if (!cancelled) {
          setMessages((current) => mergeServerMessages(data, current, activeId));
          setError("");
        }
        await loadConversations();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load chat");
        }
      }
    }

    loadThread();
    return () => {
      cancelled = true;
      persistConversationRead(activeId);
    };
  }, [activeId, loadConversations]);

  const handleRealtimeEvent = useCallback(
    (event) => {
      const currentId = activeIdRef.current;
      const myUserId = currentUserIdRef.current;
      const incoming = event.message;
      const isOwnMessage =
        incoming && myUserId && sameId(incoming.senderId, myUserId);

      if (event.type === "message" && incoming) {
        if (!event.conversationId || sameId(event.conversationId, currentId)) {
          setMessages((current) => upsertMessage(current, incoming));
        }
        if (!isOwnMessage) {
          if (sameId(event.conversationId, currentId)) {
            markConversationSeen(currentId);
            persistConversationRead(currentId);
          } else {
            loadConversations().catch(() => {});
          }
        }
        return;
      }

      if (event.type === "read") {
        return;
      }

      loadConversations().catch(() => {});

      if (!currentId) return;

      getMessages(currentId)
        .then((data) => {
          setMessages((current) => mergeServerMessages(data, current, currentId));
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
    if (activeId && !sameId(activeId, id)) {
      markConversationSeen(activeId);
      persistConversationRead(activeId);
    }
    markConversationSeen(id);
    router.replace(`/messages?id=${id}`);
  }

  function closeConversation() {
    if (activeId) {
      markConversationSeen(activeId);
      persistConversationRead(activeId);
    }
    router.replace("/messages");
    setDraft("");
  }

  function handleSend({ imageFile } = {}) {
    if (!activeId) return false;

    const text = draft.trim();
    if (!text && !imageFile) return false;

    const conversationId = String(activeId);
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const localImageUrl = imageFile ? URL.createObjectURL(imageFile) : null;
    const optimistic = {
      id: tempId,
      clientKey: tempId,
      conversationId,
      senderId: currentUserId,
      content: text || null,
      imageUrl: localImageUrl,
      sentAt: new Date().toISOString(),
      readAt: null,
      pending: true,
    };

    setError("");
    setDraft("");
    setMessages((current) => [...current, optimistic]);
    setConversations((current) => {
      const preview = previewFromSend(text, Boolean(imageFile));
      const sentAt = optimistic.sentAt;
      const next = current.map((item) =>
        sameId(item.id, conversationId)
          ? {
              ...item,
              lastMessage: preview,
              lastSentAt: sentAt,
              unreadCount: 0,
            }
          : item,
      );
      const index = next.findIndex((item) => sameId(item.id, conversationId));
      if (index <= 0) return next;
      const [active] = next.splice(index, 1);
      return [active, ...next];
    });

    sendMessage(conversationId, { content: text, imageFile })
      .then((created) => {
        setMessages((current) =>
          current.map((item) =>
            sameId(item.id, tempId)
              ? { ...created, pending: false, clientKey: item.clientKey ?? tempId }
              : item,
          ),
        );
      })
      .catch((err) => {
        setMessages((current) => current.filter((item) => !sameId(item.id, tempId)));
        setDraft(text);
        setError(err instanceof Error ? err.message : "Failed to send message");
        if (localImageUrl) URL.revokeObjectURL(localImageUrl);
      });

    return true;
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
