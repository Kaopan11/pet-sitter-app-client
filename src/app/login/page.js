import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Login | Pet Sitter App",
};

export default function OwnerLoginPage() {
  return (
    <AuthShell label="Pet Owner">
      <LoginForm
        title="Welcome back!"
        subtitle="Find your perfect pet sitter with us"
        registerHref="/register"
        registerPrompt="Don't have any account?"
        showRemember
      />
    </AuthShell>
  );
}
