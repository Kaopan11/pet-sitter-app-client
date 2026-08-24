"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/owner/profile", label: "Profile", icon: UserIcon },
  { href: "/owner/pets", label: "Your Pet", icon: PawIcon },
  { href: "/owner/bookings", label: "Booking History", icon: ListIcon },
];

const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.href !== "/owner/profile");

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="card flex h-auto w-full min-w-0 shrink-0 flex-col overflow-hidden py-0 lg:m-4 lg:mr-6 lg:py-6 lg:h-[289px] lg:w-[292px]"
      style={{ boxShadow: "4px 4px 24px 0px rgba(0, 0, 0, 0.04)", borderRadius: "16px" }}
    >
      <h4 className="hidden px-6 text-black lg:block">Account</h4>

      {/* Mobile: full-width segmented nav */}
      <nav aria-label="Account" className="flex min-w-0 items-stretch lg:hidden">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-body-1 transition-colors ${
                isActive
                  ? "bg-orange-100 text-orange-500"
                  : "text-gray-500"
              }`}
            >
              <Icon className="size-6 shrink-0" />
              <span className={isActive ? "font-bold" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop: vertical list nav */}
      <nav aria-label="Account" className="mt-4 hidden flex-col lg:flex">
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
