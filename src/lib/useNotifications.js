"use client";

import { useCallback, useEffect, useState } from "react";
import { getNotifications } from "@/lib/api";
import { getToken } from "@/lib/auth";

const POLL_MS = 20000;

export function useNotifications(enabled) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled || !getToken()) {
      setItems([]);
      setUnreadCount(0);
      return;
    }

    try {
      const data = await getNotifications();
      setItems(data.items ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // keep last known list
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
    if (!enabled) return undefined;
    const timer = window.setInterval(refresh, POLL_MS);
    return () => window.clearInterval(timer);
  }, [enabled, refresh]);

  return { items, unreadCount, refresh, setItems, setUnreadCount };
}
