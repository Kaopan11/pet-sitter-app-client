// src/app — หน้าเว็บตามโฟลเดอร์ (App Router)
// ไฟล์นี้ครอบทุกหน้า: ใส่ CSS รวม + title ของแอป
import "./globals.css";

export const metadata = {
  title: "Pet Sitter App",
  description: "Find trusted pet sitters near you",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-white">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
