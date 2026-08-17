import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/RegisterForm";

export const metadata = {
  title: "Register | Pet Sitter App",
};

// /register — หน้าสมัครเดียว มี toggle Owner / Sitter
export default function RegisterPage() {
  return (
    <AuthShell variant="light">
      <RegisterForm />
    </AuthShell>
  );
}
