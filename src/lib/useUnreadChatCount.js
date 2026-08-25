"use client";

import { useCallback, useEffect, useState } from "react";
import { getConversations } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useChatRealtime } from "@/lib/useChatRealtime";

function countUnreadPeople(conversations) {
  return conversations.filter((item) => (item.unreadCount ?? 0) > 0).length;
}

export function useUnreadChatCount(enabled) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled || !getToken()) {
      setCount(0);
      return;
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

  useChatRealtime({
    enabled,
    onEvent: refresh,
  });

  return count;
}
