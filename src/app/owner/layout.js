import Navbar from "../../components/Navbar";

export default function OwnerLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}