import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Login | Pet Sitter App",
};

// /login/owner — Pet Owner (มี Remember, Forget Password, social ตาม Figma)
export default function OwnerLoginPage() {
  return (
    <AuthShell variant="light">
      <LoginForm
        title="Welcome back!"
        subtitle="Find your perfect pet sitter with us"
        registerHref="/register"
        registerPrompt="Don't have any account?"
        showRemember
        showForgotPassword
        showSocial
      />
    </AuthShell>
  );
}
