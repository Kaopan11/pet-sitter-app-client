import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Pet Sitter Login | Pet Sitter App",
};

// /login/sitter — Pet Sitter (หน้าขาว ไม่มี social)
export default function SitterLoginPage() {
  return (
    <AuthShell variant="plain">
      <LoginForm
        title="Welcome Back!"
        subtitle="Become the best Pet Sitter with us"
        registerHref="/register"
        registerPrompt="Don't have Pet Sitter account?"
        showForgotPassword
      />
    </AuthShell>
  );
}
