"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const menuItems = [
  { href: "/sitter/profile", label: "Pet Sitter Profile", icon: UserIcon },
  { href: "/sitter/booking-list", label: "Booking List", icon: ListIcon },
  { href: "/sitter/calendar", label: "Calendar", icon: CalendarIcon },
  { href: "/sitter/payout", label: "Payout Option", icon: CardIcon },
];

export default function SitterLayout({ children }) {
  const pathname = usePathname();

  return (
    // min-h-[calc(100vh-4.5rem)]  คืออะไร?
    <div className="flex min-h-[calc(100vh-4.5rem)] bg-gray-100">
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-gray-200 bg-[#FAFAFB] pb-4">
        <div className="px-6 py-[40px]">
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
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="flex items-center gap-3 px-6 py-3 text-body-2 text-gray-400 transition-colors hover:text-gray-600"
        >
          <LogoutIcon />
          Log Out
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[72px] shrink-0 items-center justify-end gap-4 bg-white px-10">
          <div className="flex items-center gap-3">
            <span className="text-body-2 text-black">Jane Maison</span>
            <div
              className="flex h-10 w-10 items-end justify-center overflow-hidden rounded-full bg-gray-200"
              aria-hidden="true"
            >
              <svg className="h-8 w-8 text-white" viewBox="0 0 32 32" aria-hidden="true">
                <circle cx="16" cy="12" r="6" fill="currentColor" />
                <ellipse cx="16" cy="30" rx="12" ry="10" fill="currentColor" />
              </svg>
            </div>
          </div>
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:text-orange-500"
            aria-label="Open messages"
          >
            <ChatIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-8">{children}</div>
      </div>
    </div>
  );
}

function StarIcon() {
  return (
    <svg className="mt-1 h-3.5 w-3.5 text-green" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0l1.1 5.4L14.8 4.8 10.4 8l4.4 3.2-5.7-.6L8 16l-1.1-5.4-5.7.6L5.6 8 1.2 4.8l5.7.6z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5.5 19.2c.7-3.2 3.2-5 6.5-5s5.8 1.8 6.5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 7h12M8 12h12M8 17h12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="4.5" cy="7" r="1" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" />
      <circle cx="4.5" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10h17M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 16l4-4-4-4M20 12H10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20 12a7.5 7.5 0 0 1-7.5 7.5H8l-3.5 2.5V12A7.5 7.5 0 1 1 20 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
