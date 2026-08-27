import Navbar from "../../components/Navbar";

export default function MessagesLayout({ children }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <div className="hidden shrink-0 md:block">
        <Navbar />
      </div>
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
