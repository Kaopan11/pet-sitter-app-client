// src/components — เลย์เอาต์หน้า auth
// light = owner (ลายมุม) | plain = sitter (ขาวล้วน) | dark = การ์ดบนพื้นเข้ม
// responsive: มือถือเลื่อนได้ / ลดของตกแต่ง / desktop คงเลย์เอาต์เดิม

import AuthLogo from "@/components/AuthLogo";

export default function AuthShell({ label, variant = "dark", children }) {
  const isLight = variant === "light" || variant === "plain";
  const showOwnerDecor = variant === "light";

  return (
    <main
      className={`relative isolate flex min-h-svh flex-1 flex-col overflow-x-hidden ${
        isLight ? "bg-white" : "bg-footer"
      }`}
    >
      {/* Logo มุมบนซ้าย — จุดเดียวกับ Homepage (px ตรง Navbar) */}
      <div className="relative z-20 flex h-14 shrink-0 items-center px-5 sm:h-20 md:px-20">
        <AuthLogo />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-start px-5 pb-10 pt-2 sm:justify-center sm:px-6 sm:pb-16 sm:pt-0">
        {showOwnerDecor ? (
          <>
            <img
              src="/image/paw-yellow.svg"
              alt=""
              className="pointer-events-none absolute top-0 right-0 z-0 w-36 translate-x-[20%] translate-y-[-12%] select-none sm:w-52.5 sm:translate-x-[28%] sm:translate-y-[-18%]"
            />
            <img
              src="/image/corner-bottom-left.svg"
              alt=""
              className="pointer-events-none absolute bottom-0 left-0 z-0 w-40 select-none sm:w-63.75"
            />
          </>
        ) : null}

        {!isLight ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute -top-8 right-4 size-20 rotate-12 rounded-4xl bg-yellow opacity-90 sm:right-[12%] sm:size-28"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-10 left-2 size-28 rounded-full bg-green opacity-80 sm:left-[10%] sm:size-36"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-8 left-12 size-16 rounded-full bg-blue opacity-90 sm:left-[16%] sm:size-24"
            />
          </>
        ) : null}

        <div className="relative z-10 w-full max-w-100">
          {label ? (
            <p
              className={`mb-3 text-body-3 font-medium ${
                isLight ? "text-gray-500" : "text-white/80"
              }`}
            >
              {label}
            </p>
          ) : null}
          {isLight ? (
            children
          ) : (
            <div className="card border-0 p-6 shadow-dropdown sm:p-8 md:p-10">
              {children}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
