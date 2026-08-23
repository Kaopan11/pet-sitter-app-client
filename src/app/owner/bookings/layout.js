import Navbar from "../../../components/Navbar";

export default function OwnerBookingsLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
    </>
  );
}
