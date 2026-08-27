// src/app — หน้าเว็บตามโฟลเดอร์ (App Router)
// ไฟล์นี้ครอบทุกหน้า: ใส่ CSS รวม + title ของแอป
import "./globals.css";
import Toaster from "@/components/Toaster";

export const metadata = {
  title: "Pet Sitter App",
  description: "Find trusted pet sitters near you",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-white">
        <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
