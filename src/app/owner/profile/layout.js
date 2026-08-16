import Navbar from "../../../components/Navbar";

export default function OwnerLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
    </>
  );
}