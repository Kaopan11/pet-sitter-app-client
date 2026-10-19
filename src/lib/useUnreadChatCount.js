"use client";

import { useCallback, useEffect, useState } from "react";
import { getConversations } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";
import { useChatRealtime } from "@/lib/useChatRealtime";

function countUnreadPeople(conversations) {
  return conversations.filter((item) => (item.unreadCount ?? 0) > 0).length;
}

// Don't bump the navbar badge if that thread is already open.
function isViewingConversation(conversationId) {
  if (typeof window === "undefined" || conversationId == null) return false;
  const { pathname, search } = window.location;
  if (!pathname.startsWith("/messages")) return false;
  const openId = new URLSearchParams(search).get("id");
  return openId != null && String(openId) === String(conversationId);
}

// Navbar/sitter-header badge: how many conversations have unreadCount > 0. Refreshes on SSE + GET /api/conversations.
export function useUnreadChatCount(enabled) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async (event) => {
    if (!enabled || !getToken()) {
      setCount(0);
      return;
    }

    // Own outbound messages shouldn't increment the badge.
    if (event?.type === "message" && event.message) {
      const me = getUser()?.id;
      if (me && String(event.message.senderId) === String(me)) {
        return;
      }
      if (isViewingConversation(event.conversationId)) {
        return;
      }
    }

    try {
      const conversations = await getConversations();
      setCount(countUnreadPeople(conversations));
    } catch {
      // keep the last known count
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    function handleUnreadCleared() {
      setCount((value) => Math.max(0, value - 1));
    }

    // Messages page fires this after marking a thread seen, so the badge drops without waiting for a refetch.
    window.addEventListener("chat-unread-cleared", handleUnreadCleared);
    return () => {
      window.removeEventListener("chat-unread-cleared", handleUnreadCleared);
    };
  }, []);

  useChatRealtime({
    enabled,
    onEvent: refresh,
  });

  return count;
}
