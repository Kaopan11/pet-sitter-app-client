import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/RegisterForm";

export const metadata = {
  title: "Register | Pet Sitter App",
};

// /register — หน้าสมัครเดียว มี toggle Owner / Sitter
// ?type=sitter (จากปุ่ม Become a Pet Sitter) → เปิดมาพร้อม tab Sitter
export default async function RegisterPage({ searchParams }) {
  const { type } = await searchParams;
  const initialMode = type === "sitter" ? "sitter" : "owner";

  return (
    <AuthShell variant="light">
      <RegisterForm initialMode={initialMode} />
    </AuthShell>
  );
}
