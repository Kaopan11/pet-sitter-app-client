"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";
import Icon from "@/components/Icon";

const navItems = [
  {
    name: "Pet Owner",
    href: "/admin/pet-owner",
    iconSrc: "/icon/user.svg",
  },
  {
    name: "Pet Sitter",
    href: "/admin/pet-sitter",
    iconSrc: "/icon/paw.svg",
  },
  {
    name: "Report",
    href: "/admin/report",
    iconSrc: "/icon/copy.svg",
  },
];

function menuClassName(isActive) {
  return `flex h-14 w-full items-center gap-4 px-6 py-4 text-body-2 tracking-[-0.02em] transition-colors duration-300 ease-out ${
    isActive
      ? "bg-gray-600 text-white"
      : "text-gray-300 hover:bg-gray-600 hover:text-white"
  }`;
}

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push("/login/admin");
  };

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-60 shrink-0 flex-col border-r border-gray-500 bg-black py-4 text-white transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <header className="flex items-start justify-between gap-2 px-6 py-10">
          <Link href="/admin/pet-owner" className="flex flex-col gap-1">
            <Image
              src="/image/Sitter-logo-white.svg"
              alt="Sitter logo"
              width={134}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
            <p className="text-body-3 text-gray-300">Admin Panel</p>
          </Link>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-300 hover:bg-gray-600 lg:hidden"
              aria-label="Close sidebar"
            >
              <Icon src="/icon/x.svg" className="h-6 w-6" />
            </button>
          ) : null}
        </header>

        <nav className="flex flex-col" aria-label="Admin menu">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={menuClassName(isActive)}
              >
                <Icon src={item.iconSrc} className="h-6 w-6" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className={`${menuClassName(false)} mt-auto border-t border-gray-500`}
        >
          <Icon src="/icon/logout.svg" className="h-6 w-6" />
          Log Out
        </button>
      </aside>
    </>
  );
}
