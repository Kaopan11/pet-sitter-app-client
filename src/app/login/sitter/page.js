import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Pet Sitter Login | Pet Sitter App",
};

export default function SitterLoginPage() {
  return (
    <AuthShell label="Pet Sitter">
      <LoginForm
        title="Welcome Back!"
        subtitle="Become the best Pet Sitter with us"
        registerHref="/register/sitter"
        registerPrompt="Don't have Pet Sitter account?"
      />
    </AuthShell>
  );
}
