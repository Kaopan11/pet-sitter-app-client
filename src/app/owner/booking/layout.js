/** Layout หน้า booking — พื้นเทา (Navbar มาจาก owner/layout.js) */
export default function OwnerBookingLayout({ children }) {
  return (
    <main
      className="relative flex-1 overflow-hidden bg-[#FAFAFA]"
      style={{ minHeight: "calc(100vh - 5rem)" }}
    >
      {children}
    </main>
  );
}
