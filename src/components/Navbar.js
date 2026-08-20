"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearAuth, getToken, getUser } from "@/lib/auth";

const FALLBACK_AVATAR = "/navbar/profile.png";

function getAvatarSrc(user) {
  return (
    user?.avatarUrl ||
    user?.avatar ||
    user?.profileImage ||
    user?.image ||
    FALLBACK_AVATAR
  );
}

const MENU_ITEMS = [
  { href: "/profile", label: "Profile", icon: "/navbar/menu-profile.svg" },
  { href: "/pets", label: "Your Pet", icon: "/navbar/menu-paw.svg" },
  { href: "/history", label: "History", icon: "/navbar/menu-history.svg" },
];

function Logo() {
  return (
    <Link
      href="/"
      className="relative block h-10 w-[132px] shrink-0"
      aria-label="Sitter home"
    >
      <span className="absolute top-[9.68%] right-[17.58%] bottom-[11.15%] left-[1.96%]">
        <img
          src="/navbar/logo-sitter.svg"
          alt=""
          className="size-full object-contain object-left"
        />
      </span>
      <span className="absolute top-[9.68%] right-[1.96%] bottom-[48.39%] left-[85.29%]">
        <img
          src="/navbar/logo-star.svg"
          alt=""
          className="size-full object-contain"
        />
      </span>
    </Link>
  );
}

function IconButton({ src, alt, hasDot }) {
  return (
    <button
      type="button"
      className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-100"
      aria-label={alt}
    >
      <span className="relative block size-6 overflow-clip">
        <img src={src} alt="" className="size-full object-contain" />
      </span>
      {hasDot ? (
        <img
          src="/navbar/icon-dot.svg"
          alt=""
          className="absolute top-1 right-1.5 size-1.5"
        />
      ) : null}
    </button>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const mobileNavRef = useRef(null);
  const isLoggedIn = Boolean(user);
  const avatarSrc = getAvatarSrc(user);
  const isRemoteAvatar =
    typeof avatarSrc === "string" && /^https?:\/\//.test(avatarSrc);

  useEffect(() => {
    function syncUser() {
      const token = getToken();
      setUser(token ? getUser() : null);
      setReady(true);
    }

    syncUser();
    window.addEventListener("owner-profile-updated", syncUser);
    return () => window.removeEventListener("owner-profile-updated", syncUser);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    function handlePointerDown(event) {
      if (!mobileNavRef.current?.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [mobileMenuOpen]);

  function handleLogout() {
    setMenuOpen(false);
    setMobileMenuOpen(false);
    clearAuth();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF] shadow-[0_1px_0_0_var(--gray-200)]">
      <nav className="mx-auto flex h-20 w-full items-center justify-between px-5 md:px-20">
        <Logo />

        {!ready ? (
          <div className="h-12 w-40" aria-hidden />
        ) : isLoggedIn ? (
          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-3">
              <IconButton src="/navbar/icon-bell.svg" alt="Notifications" hasDot />
              <IconButton src="/navbar/icon-chat.svg" alt="Messages" hasDot />

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className="relative size-12 overflow-clip rounded-full"
                  aria-label="Open profile menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  {isRemoteAvatar ? (
                    <img
                      src={avatarSrc}
                      alt={user?.name || "Profile"}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <Image
                      src={avatarSrc}
                      alt={user?.name || "Profile"}
                      width={48}
                      height={48}
                      className="size-12 rounded-full object-cover"
                    />
                  )}
                </button>

                {menuOpen ? (
                  <div className="absolute top-[calc(100%+8px)] right-0 z-50 flex w-[186px] flex-col overflow-clip rounded-lg bg-[#FFFFFF] py-1 shadow-[4px_4px_24px_0px_rgba(0,0,0,0.04)]">
                    <div className="flex flex-col py-2">
                      {MENU_ITEMS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex w-full items-center gap-3 px-6 py-2 text-body-2 text-black hover:bg-gray-100"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="relative block size-5 overflow-clip">
                            <img
                              src={item.icon}
                              alt=""
                              className="size-full object-contain"
                            />
                          </span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="flex flex-col border-t border-gray-200 py-2">
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-6 py-2 text-left text-body-2 text-black hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        <span className="relative block size-5 overflow-clip">
                          <img
                            src="/navbar/menu-logout.svg"
                            alt=""
                            className="size-full object-contain"
                          />
                        </span>
                        Log out
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <Link href="/find-sitter" className="btn btn-primary min-w-[120px] text-[#FFFFFF]">
              Find A Pet Sitter
            </Link>
          </div>
        ) : (
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/register?type=sitter"
              className="px-6 py-4 text-body-1 text-black"
            >
              Become a Pet Sitter
            </Link>
            <Link href="/login" className="px-6 py-4 text-body-1 text-black">
              Login
            </Link>
            <Link href="/find-sitter" className="btn btn-primary min-w-[120px] text-[#FFFFFF]">
              Find A Pet Sitter
            </Link>
          </div>
        )}

        {ready ? (
          <button
            type="button"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-black md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        ) : null}
      </nav>

      {ready && mobileMenuOpen ? (
        <div
          ref={mobileNavRef}
          className="flex flex-col gap-1 border-t border-gray-200 bg-[#FFFFFF] px-5 py-4 md:hidden"
        >
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 pb-2">
                <IconButton src="/navbar/icon-bell.svg" alt="Notifications" hasDot />
                <IconButton src="/navbar/icon-chat.svg" alt="Messages" hasDot />
              </div>
              {MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-2 py-3 text-body-2 text-black"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="relative block size-5 overflow-clip">
                    <img src={item.icon} alt="" className="size-full object-contain" />
                  </span>
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                className="flex items-center gap-3 px-2 py-3 text-left text-body-2 text-black"
                onClick={handleLogout}
              >
                <span className="relative block size-5 overflow-clip">
                  <img
                    src="/navbar/menu-logout.svg"
                    alt=""
                    className="size-full object-contain"
                  />
                </span>
                Log out
              </button>
              <Link
                href="/find-sitter"
                className="btn btn-primary mt-2 w-full text-[#FFFFFF]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find A Pet Sitter
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register?type=sitter"
                className="px-2 py-3 text-body-1 text-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                Become a Pet Sitter
              </Link>
              <Link
                href="/login"
                className="px-2 py-3 text-body-1 text-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/find-sitter"
                className="btn btn-primary mt-2 w-full text-[#FFFFFF]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find A Pet Sitter
              </Link>
            </>
          )}
        </div>
      ) : null}
    </header>
  );
}
