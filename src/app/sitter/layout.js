"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, List, UserRound, CreditCard, LogOut, MessagesSquare, ArrowLeftRight } from "lucide-react";
import axios from "axios";
import { getUser } from "@/lib/auth";
import jwtInterceptor from "@/utils/jwtInterceptor";

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

export default function SitterLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSitter, setIsSitter] = useState(false);
  const [headerUser, setHeaderUser] = useState({ name: "", avatarUrl: "" });

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

  if (!isSitter) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gray-100">
      <aside className="flex h-full w-60 shrink-0 flex-col border-r border-gray-200 bg-[#FAFAFB]">
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
            className="flex w-full items-center gap-3 px-6 py-6 text-body-2 text-gray-400 transition-colors hover:text-gray-600"
          >
            <LogOut className="h-6 w-6" />
            Log Out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-18 shrink-0 items-center justify-between bg-white px-16">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200">
              {headerUser.avatarUrl ? (
                <img
                  src={headerUser.avatarUrl}
                  alt={`${headerUser.name || "Pet sitter"} profile`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-6 w-6 text-white" aria-hidden="true" />
              )}
            </div>
            <span className="text-body-2 text-gray-600">
              {headerUser.name || "Pet Sitter"}
            </span>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:text-orange-500"
            aria-label="Open messages"
          >
            <MessagesSquare className="h-6 w-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-12 py-8">{children}</div>
      </div>
    </div>
  );
}
