"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

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

  const handleLogout = () => {
    clearAuth();
    router.push("/login/admin");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col justify-between bg-[#000000] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6 w-full">
          {/* Logo Section - Exact Figma Colors: Orange "Si", White "tter", Green "*" */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <Link href="/admin/pet-owner" className="flex flex-col">
              <div className="flex items-baseline font-black tracking-tight text-3xl">
                <span className="text-[#FF7037]">Si</span>
                <span className="text-white">tter</span>
                <span className="text-[#1CCD83] ml-0.5">*</span>
              </div>
              <span className="text-xs italic text-gray-400 font-light tracking-wide -mt-1">
                Admin Panel
              </span>
            </Link>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:bg-[#3A3B46] lg:hidden"
                aria-label="Close sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation Links - Full width, bg-gray-600 (#3A3B46) for hover & active */}
          <nav className="flex flex-col w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-6 py-4 text-sm font-medium transition-all w-full ${
                    isActive
                      ? "bg-[#3A3B46] text-white font-medium"
                      : "text-gray-400 hover:bg-[#3A3B46] hover:text-white"
                  }`}
                >
                  <Image
                    src={item.iconSrc}
                    alt={item.name}
                    width={20}
                    height={20}
                    className={`w-5 h-5 transition-opacity ${
                      isActive ? "brightness-0 invert opacity-100" : "brightness-0 invert opacity-60"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Log Out Section at bottom using /icon/logout.svg */}
        <div className="border-t border-neutral-900 w-full">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 px-6 py-4 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#3A3B46] transition-all cursor-pointer group"
          >
            <Image
              src="/icon/logout.svg"
              alt="Log Out"
              width={20}
              height={20}
              className="w-5 h-5 brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity"
            />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
