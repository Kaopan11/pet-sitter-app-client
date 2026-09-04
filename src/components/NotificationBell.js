"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api";
import { formatDate, formatMessageTime } from "@/utils/formatDateTime";
import { useNotifications } from "@/lib/useNotifications";

function formatWhen(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const sameDay =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  return sameDay ? formatMessageTime(value) : formatDate(value);
}

export default function NotificationBell({
  enabled,
  variant = "circle",
  iconSrc,
}) {
  const router = useRouter();
  const { items, unreadCount, refresh, setItems, setUnreadCount } =
    useNotifications(enabled);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const isPlain = variant === "plain";
  const isLucide = variant === "lucide";

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  async function handleMarkAll() {
    try {
      const data = await markAllNotificationsRead();
      setItems(data.items ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // keep list
    }
  }

  async function handleItemClick(item) {
    setOpen(false);
    if (!item.readAt) {
      try {
        const data = await markNotificationRead(item.id);
        setItems(data.items ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      } catch {
        setUnreadCount((count) => Math.max(0, count - 1));
        setItems((list) =>
          list.map((row) =>
            row.id === item.id ? { ...row, readAt: new Date().toISOString() } : row,
          ),
        );
      }
    }
    if (item.href) router.push(item.href);
  }

  if (!enabled) return null;

  const buttonClass = isLucide
    ? "relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:text-orange-500"
    : isPlain
      ? "relative flex size-6 shrink-0 cursor-pointer items-center justify-center"
      : "relative flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-100";

  return (
    <div className="relative z-50" ref={rootRef}>
      <button
        type="button"
        className={buttonClass}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => {
            const next = !value;
            if (next) void refresh();
            return next;
          });
        }}
      >
        {isLucide ? (
          <Bell className="h-6 w-6" />
        ) : (
          <span className="relative block size-6 overflow-clip">
            <img src={iconSrc || "/navbar/icon-bell.svg"} alt="" className="size-full object-contain" />
          </span>
        )}
        {unreadCount > 0 ? (
          isLucide || !isPlain ? (
            <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : (
            <img
              src="/navbar/icon-dot.svg"
              alt=""
              className="absolute -top-0.5 -right-0.5 size-1.5"
            />
          )
        ) : null}
      </button>

      {open ? (
        <div
          className="fixed inset-x-4 top-14 z-[60] flex max-h-[calc(100dvh-4rem)] flex-col overflow-hidden rounded-lg bg-white shadow-[4px_4px_24px_0px_rgba(0,0,0,0.08)] md:absolute md:inset-x-auto md:right-0 md:top-[calc(100%+8px)] md:max-h-none md:w-[min(calc(100vw-2.5rem),360px)]"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
            <p className="text-body-2 font-medium text-gray-900">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                className="cursor-pointer text-body-3 text-orange-500 hover:text-orange-600"
                onClick={handleMarkAll}
              >
                Mark all as read
              </button>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto md:max-h-80">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-body-3 text-gray-400">
                No notifications yet
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`flex w-full cursor-pointer flex-col gap-0.5 border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-100 ${
                    item.readAt ? "bg-white" : "bg-orange-100"
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <span className="text-body-2 text-gray-900">{item.title}</span>
                  <span className="text-body-3 text-gray-500">{item.body}</span>
                  <span className="text-[12px] text-gray-400">
                    {formatWhen(item.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
