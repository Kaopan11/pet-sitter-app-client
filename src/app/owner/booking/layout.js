import Navbar from "@/components/Navbar";

/** Layout หน้า booking — Navbar + พื้นเทาเต็มจอที่เหลือ (Navbar = 5rem) */
export default function OwnerBookingLayout({ children }) {
  return (
    <>
      <Navbar />
      <main
        className="relative flex-1 overflow-hidden bg-[#FAFAFA]"
        style={{ minHeight: "calc(100vh - 5rem)" }}
      >
        {children}
      </main>
    </>
  );
}
