"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/owner/profile", label: "Profile", icon: UserIcon },
  { href: "/owner/pets", label: "Your Pet", icon: PawIcon },
  { href: "/owner/bookings", label: "Booking History", icon: ListIcon },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="card m-4 mr-6 flex h-[289px] w-[292px] shrink-0 flex-col overflow-hidden py-6">
      <h4 className="px-6 text-black">Account</h4>

      <nav aria-label="Account" className="mt-4 flex flex-col">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-4 px-6 py-3 text-body-1 transition-colors ${
                isActive
                  ? "bg-orange-100 text-orange-500"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Icon className="size-6 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function UserIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19.5c.9-3.4 3.4-5.25 6.5-5.25s5.6 1.85 6.5 5.25" />
    </svg>
  );
}

function PawIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="5.8" cy="10.2" r="1.55" />
      <circle cx="9.2" cy="6.4" r="1.55" />
      <circle cx="14.8" cy="6.4" r="1.55" />
      <circle cx="18.2" cy="10.2" r="1.55" />
      <path d="M8.4 13.4c-1.7.9-2.5 2.6-2 4.3.5 1.6 2.3 2.8 5.6 2.8s5.1-1.2 5.6-2.8c.5-1.7-.3-3.4-2-4.3-1.1-.6-2.3-.9-3.6-.9s-2.5.3-3.6.9Z" />
    </svg>
  );
}

function ListIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6.5h11" />
      <path d="M9 12h11" />
      <path d="M9 17.5h11" />
      <circle cx="4.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
