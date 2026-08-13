import "./globals.css";

export const metadata = {
  title: "Pet Sitter App",
  description: "Find trusted pet sitters near you",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
