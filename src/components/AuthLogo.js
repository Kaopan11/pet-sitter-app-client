import Link from "next/link";

/**
 * Logo หน้า Login / Register — ตำแหน่งและรูปแบบเดียวกับ Navbar บน Homepage
 * กดแล้วกลับไปหน้าแรก (/)
 */
export default function AuthLogo() {
  return (
    <Link
      href="/"
      className="relative block h-10 w-33 shrink-0"
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
