import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/RegisterForm";

export const metadata = {
  title: "Register | Pet Sitter App",
};

export default function OwnerRegisterPage() {
  return (
    <AuthShell label="Pet Owner">
      <RegisterForm
        title="Join Us!"
        subtitle="Find your perfect pet sitter with us"
        role="pet_owner"
        loginHref="/login"
        loginPrompt="Already have an account?"
      />
    </AuthShell>
  );
}
