import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

// Layout ของหน้า public (ไม่ต้อง login) ครอบทุกหน้าในกลุ่มนี้ด้วย Navbar และ Footer เสมอ
export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
