"use client";

import { useEffect, useRef } from "react";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const POLL_MS = 3000;
const RETRY_MS = 2000;

function parseSseChunk(buffer, onEvent) {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";

  for (const part of parts) {
    const dataLine = part
      .split("\n")
      .find((line) => line.startsWith("data:"));
    if (!dataLine) continue;
    const json = dataLine.replace(/^data:\s?/, "");
    try {
      const payload = JSON.parse(json);
      if (payload?.type && payload.type !== "connected") {
        onEvent(payload);
      }
    } catch {
      // ignore malformed chunks
    }
  }

  return rest;
}

export function useChatRealtime({ enabled, onEvent }) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled || !API_URL) return undefined;

    let stopped = false;
    let pollTimer = null;
    const abort = new AbortController();

    function emit(payload) {
      if (!stopped) onEventRef.current(payload);
    }

    function startPolling() {
      if (pollTimer || stopped) return;
      pollTimer = setInterval(() => {
        emit({ type: "refresh" });
      }, POLL_MS);
    }

    function stopPolling() {
      if (!pollTimer) return;
      clearInterval(pollTimer);
      pollTimer = null;
    }

    async function connect() {
      while (!stopped) {
        const token = getToken();
        if (!token) {
          startPolling();
          return;
        }

        try {
          const res = await fetch(`${API_URL}/api/conversations/events`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
            signal: abort.signal,
          });

          if (!res.ok || !res.body) {
            throw new Error(`SSE failed (${res.status})`);
          }

          stopPolling();
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (!stopped) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            buffer = parseSseChunk(buffer, emit);
          }

          startPolling();
        } catch {
          if (stopped || abort.signal.aborted) return;
          startPolling();
          await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
        }
      }
    }

    connect();

    return () => {
      stopped = true;
      abort.abort();
      stopPolling();
    };
  }, [enabled]);
}
