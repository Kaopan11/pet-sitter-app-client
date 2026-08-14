// src/components — เลย์เอาต์หน้า auth
// light = owner (ลายมุม) | plain = sitter (ขาวล้วน) | dark = การ์ดบนพื้นเข้ม

export default function AuthShell({ label, variant = "dark", children }) {
  const isLight = variant === "light" || variant === "plain";
  const showOwnerDecor = variant === "light";

  return (
    <main
      className={`relative isolate flex min-h-svh flex-1 items-center justify-center overflow-hidden px-4 py-16 ${
        isLight ? "bg-white" : "bg-footer"
      }`}
    >
      {showOwnerDecor ? (
        <>
          <img
            src="/image/paw-yellow.svg"
            alt=""
            className="pointer-events-none absolute top-0 right-0 z-0 w-52.5 translate-x-[28%] translate-y-[-18%] select-none"
          />
          <img
            src="/image/corner-bottom-left.svg"
            alt=""
            className="pointer-events-none absolute bottom-0 left-0 z-0 w-63.75 select-none"
          />
        </>
      ) : null}

      {!isLight ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-8 right-8 size-28 rotate-12 rounded-4xl bg-yellow opacity-90 sm:right-[12%]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 left-4 size-36 rounded-full bg-green opacity-80 sm:left-[10%]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-8 left-20 size-24 rounded-full bg-blue opacity-90 sm:left-[16%]"
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
          <div className="card border-0 p-8 shadow-dropdown sm:p-10">{children}</div>
        )}
      </div>
    </main>
  );
}
