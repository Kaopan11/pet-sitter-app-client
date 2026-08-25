import Navbar from "../../components/Navbar";

export default function MessagesLayout({ children }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <Navbar />
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
