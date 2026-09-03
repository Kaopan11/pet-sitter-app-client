"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, List, UserRound, CreditCard, LogOut, MessagesSquare, ArrowLeftRight } from "lucide-react";
import axios from "axios";
import { clearAuth, getUser } from "@/lib/auth";
import jwtInterceptor from "@/utils/jwtInterceptor";
import { useUnreadChatCount } from "@/lib/useUnreadChatCount";
import NotificationBell from "@/components/NotificationBell";

jwtInterceptor();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const menuItems = [
  {
    href: "/sitter/profile",
    label: "Pet Sitter Profile",
    icon: UserRound,
  },
  {
    href: "/sitter/booking-list",
    label: "Booking List",
    icon: List,
  },
  {
    href: "/sitter/calendar",
    label: "Calendar",
    icon: Calendar,
  },
  {
    href: "/sitter/payout",
    label: "Payout Option",
    icon: CreditCard,
  },
];

export default function SitterLayout({ children, precheckedSitter = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSitter, setIsSitter] = useState(precheckedSitter);
  const [headerUser, setHeaderUser] = useState({ name: "", avatarUrl: "" });
  const unreadChatCount = useUnreadChatCount(isSitter);

  useEffect(() => {
    const user = getUser();
    if (!user?.isSitter) {
      router.replace("/");
      return;
    }

    setIsSitter(true);

    async function loadHeaderUser() {
      try {
        const { data: json } = await axios.get(`${API_BASE_URL}/api/sitters/me`);

        setHeaderUser({
          name: json.data?.name ?? "",
          avatarUrl: json.data?.avatar_url ?? "",
        });
      } catch {
        setHeaderUser({ name: "", avatarUrl: "" });
      }
    }

    loadHeaderUser();
    window.addEventListener("sitter-profile-updated", loadHeaderUser);
    return () => {
      window.removeEventListener("sitter-profile-updated", loadHeaderUser);
    };
  }, [router]);

  function handleLogout() {
    clearAuth();
    window.location.href = "/";
  }

  if (!isSitter) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gray-100">
      <aside
        className={`h-full w-60 shrink-0 flex-col border-r border-gray-200 bg-[#FAFAFB] ${
          pathname === "/messages" ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="px-6 py-10">
          <Link href="/">
            <Image src="/image/logo.png" alt="Sitter logo" width={120} height={40} />
          </Link>
        </div>

        <nav className="flex flex-col" aria-label="Sitter menu">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-4 text-body-2 transition-colors ${
                  isActive
                    ? "text-orange-500 bg-orange-100"
                    : "text-gray-500 hover:text-gray-600"
                }`}
              >
                <Icon className="h-6 w-6" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto mb-4 border-t border-gray-200">
          <Link
            href="/owner/profile"
            className="flex items-center gap-3 px-6 py-4 text-body-2 text-gray-400 transition-colors hover:text-gray-600"
          >
            <ArrowLeftRight className="h-6 w-6" />
            Switch to Pet Owner
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 px-6 py-6 text-body-2 text-gray-400 transition-colors hover:text-gray-600"
          >
            <LogOut className="h-6 w-6" />
            Log Out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className={`relative z-20 h-18 shrink-0 items-center justify-between bg-white ${
            pathname === "/messages"
              ? "hidden px-4 md:flex md:px-16"
              : "flex px-16"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200">
              {headerUser.avatarUrl ? (
                <Image
                  src={headerUser.avatarUrl}
                  alt={`${headerUser.name || "Pet sitter"} profile`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <UserRound className="h-6 w-6 text-white" aria-hidden="true" />
              )}
            </div>
            <span className="text-body-2 text-gray-600">
              {headerUser.name || "Pet Sitter"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell enabled={isSitter} variant="lucide" />
            <Link
            href="/messages"
            className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 transition-colors hover:text-orange-500 ${
              pathname === "/messages" ? "text-orange-500" : "text-gray-400"
            }`}
            aria-label={
              unreadChatCount > 0
                ? `Open messages, ${unreadChatCount} unread`
                : "Open messages"
            }
          >
            <MessagesSquare className="h-6 w-6" />
            {unreadChatCount > 0 ? (
              <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                {unreadChatCount > 9 ? "9+" : unreadChatCount}
              </span>
            ) : null}
          </Link>
          </div>
        </header>

        <div
          className={
            pathname === "/messages"
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : "flex-1 overflow-y-auto px-12 py-8"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
