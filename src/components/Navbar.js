"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getToken, getUser, updateStoredUser, saveAuth } from "@/lib/auth";
import { becomeSitter } from "@/lib/api";

const FALLBACK_AVATAR = "/icon/user.svg";

function getAvatarSrc(user) {
  return (
    user?.avatarUrl ||
    user?.avatar_url ||
    user?.avatar ||
    user?.profileImage ||
    user?.image ||
    FALLBACK_AVATAR
  );
}

const MENU_ITEMS = [
  { href: "/owner/profile", label: "Profile", icon: "/navbar/menu-profile.svg" },
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

function MenuItemIcon({ src }) {
  return (
    <span className="relative block size-5 overflow-clip">
      <img src={src} alt="" className="size-full object-contain" />
    </span>
  );
}

function BecomeSitterModal({ onCancel, onConfirm, loading, error }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={loading ? undefined : onCancel}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="become-sitter-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 id="become-sitter-title" className="text-h4 text-gray-900">
            Become a Pet Sitter
          </h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-6">
          <p className="text-body-2 text-gray-500">
            Are you sure you want to become a pet sitter?
          </p>
          {error ? <p className="mt-3 text-body-3 text-red">{error}</p> : null}
        </div>
        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? "Confirming..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function IconButton({ src, alt, hasDot }) {
  return (
    <button
      type="button"
      className="relative flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-100"
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
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [becomeSitterOpen, setBecomeSitterOpen] = useState(false);
  const [becomeSitterLoading, setBecomeSitterLoading] = useState(false);
  const [becomeSitterError, setBecomeSitterError] = useState("");
  const menuRef = useRef(null);
  const mobileNavRef = useRef(null);
  const isLoggedIn = Boolean(user);
  const isSitter = Boolean(user?.isSitter);
  const avatarSrc = getAvatarSrc(user);
  const isRemoteAvatar =
    typeof avatarSrc === "string" && /^https?:\/\//.test(avatarSrc);

  useEffect(() => {
    let cancelled = false;

    function syncFromStorage() {
      const token = getToken();
      setUser(token ? getUser() : null);
    }

    async function refreshFromApi() {
      syncFromStorage();
      const token = getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!token || !apiUrl) return;

      try {
        const res = await fetch(`${apiUrl}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || cancelled || !json.data) return;

        const nextUser = updateStoredUser({
          name: json.data.name,
          email: json.data.email,
          phone: json.data.phone,
          avatarUrl: json.data.avatar_url ?? json.data.avatarUrl,
        });
        if (!cancelled && nextUser) setUser(nextUser);
      } catch {
        // keep the user already loaded from storage
      }
    }

    refreshFromApi();
    window.addEventListener("auth-changed", syncFromStorage);
    window.addEventListener("owner-profile-updated", refreshFromApi);
    window.addEventListener("sitter-profile-updated", refreshFromApi);
    return () => {
      cancelled = true;
      window.removeEventListener("auth-changed", syncFromStorage);
      window.removeEventListener("owner-profile-updated", refreshFromApi);
      window.removeEventListener("sitter-profile-updated", refreshFromApi);
    };
  }, [pathname]);

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

  useEffect(() => {
    if (!becomeSitterOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !becomeSitterLoading) {
        setBecomeSitterOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [becomeSitterOpen, becomeSitterLoading]);

  function closeMenus() {
    setMenuOpen(false);
    setMobileMenuOpen(false);
  }

  function handleOpenBecomeSitter() {
    closeMenus();
    setBecomeSitterError("");
    setBecomeSitterOpen(true);
  }

  async function handleConfirmBecomeSitter() {
    const token = getToken();
    const currentUser = getUser();
    if (!token || !currentUser) {
      setBecomeSitterError("Please log in again");
      return;
    }

    setBecomeSitterError("");
    setBecomeSitterLoading(true);

    try {
      const data = await becomeSitter();
      const persist = Boolean(localStorage.getItem("pet-sitter-token"));
      const nextUser = {
        ...currentUser,
        ...(data?.user ?? {}),
        isSitter: true,
      };
      saveAuth({ token, user: nextUser }, persist);
      setUser(nextUser);
      setBecomeSitterOpen(false);
      router.push("/sitter/profile");
    } catch (err) {
      setBecomeSitterError(
        err instanceof Error ? err.message : "Failed to become a pet sitter",
      );
    } finally {
      setBecomeSitterLoading(false);
    }
  }

  function handleLogout() {
    closeMenus();
    clearAuth();
    setUser(null);
    window.location.href = "/";
  }

  return (
    <>
    <header className="sticky top-0 z-50 bg-[#FFFFFF] shadow-[0_1px_0_0_var(--gray-200)]">
      <nav className="mx-auto flex h-20 w-full items-center justify-between px-5 md:px-20">
        <Logo />

        {isLoggedIn ? (
          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-3">
              <IconButton src="/navbar/icon-bell.svg" alt="Notifications" hasDot />
              <IconButton src="/navbar/icon-chat.svg" alt="Messages" hasDot />

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className="relative flex size-12 cursor-pointer items-center justify-center overflow-clip rounded-full bg-gray-200"
                  aria-label="Open profile menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  {isRemoteAvatar ? (
                    <img
                      key={avatarSrc}
                      src={avatarSrc}
                      alt={user?.name || "Profile"}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <img
                      src={FALLBACK_AVATAR}
                      alt={user?.name || "Profile"}
                      className="size-6"
                    />
                  )}
                </button>

                {menuOpen ? (
                  <div className="absolute top-[calc(100%+8px)] right-0 z-50 flex min-w-[186px] w-max flex-col overflow-clip rounded-lg bg-[#FFFFFF] py-1 shadow-[4px_4px_24px_0px_rgba(0,0,0,0.04)]">
                    <div className="flex flex-col py-2">
                      {MENU_ITEMS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex w-full items-center gap-3 px-6 py-2 text-body-2 text-black hover:bg-gray-100"
                          onClick={closeMenus}
                        >
                          <MenuItemIcon src={item.icon} />
                          {item.label}
                        </Link>
                      ))}
                      {isSitter ? (
                        <Link
                          href="/sitter/profile"
                          className="flex w-full items-center gap-3 px-6 py-2 text-body-2 text-black hover:bg-gray-100"
                          onClick={closeMenus}
                        >
                          <MenuItemIcon src="/navbar/menu-profile.svg" />
                          Sitter Profile
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-center gap-3 px-6 py-2 text-left text-body-2 text-black hover:bg-gray-100"
                          onClick={handleOpenBecomeSitter}
                        >
                          <MenuItemIcon src="/navbar/menu-profile.svg" />
                          Become a Pet Sitter
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col border-t border-gray-200 py-2">
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center gap-3 px-6 py-2 text-left text-body-2 text-black hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        <MenuItemIcon src="/navbar/menu-logout.svg" />
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
              Register
            </Link>
            <Link href="/login" className="px-6 py-4 text-body-1 text-black">
              Login
            </Link>
            <Link href="/find-sitter" className="btn btn-primary min-w-[120px] text-[#FFFFFF]">
              Find A Pet Sitter
            </Link>
          </div>
        )}

        <button
          type="button"
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-black md:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {mobileMenuOpen ? (
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
                  onClick={closeMenus}
                >
                  <MenuItemIcon src={item.icon} />
                  {item.label}
                </Link>
              ))}
              {isSitter ? (
                <Link
                  href="/sitter/profile"
                  className="flex items-center gap-3 px-2 py-3 text-body-2 text-black"
                  onClick={closeMenus}
                >
                  <MenuItemIcon src="/navbar/menu-profile.svg" />
                  Sitter Profile
                </Link>
              ) : (
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-3 px-2 py-3 text-left text-body-2 text-black"
                  onClick={handleOpenBecomeSitter}
                >
                  <MenuItemIcon src="/navbar/menu-profile.svg" />
                  Become a Pet Sitter
                </button>
              )}
              <button
                type="button"
                className="flex cursor-pointer items-center gap-3 px-2 py-3 text-left text-body-2 text-black"
                onClick={handleLogout}
              >
                <MenuItemIcon src="/navbar/menu-logout.svg" />
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
                Register
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

      {becomeSitterOpen ? (
        <BecomeSitterModal
          onCancel={() => !becomeSitterLoading && setBecomeSitterOpen(false)}
          onConfirm={handleConfirmBecomeSitter}
          loading={becomeSitterLoading}
          error={becomeSitterError}
        />
      ) : null}
    </>
  );
}
