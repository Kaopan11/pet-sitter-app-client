import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/RegisterForm";

export const metadata = {
  title: "Pet Sitter Register | Pet Sitter App",
};

export default function SitterRegisterPage() {
  return (
    <AuthShell label="Pet Sitter">
      <RegisterForm
        title="Join Us"
        subtitle="Become the best Pet Sitter with us"
        role="pet_sitter"
        loginHref="/login/sitter"
        loginPrompt="Already have Pet Sitter account?"
      />
    </AuthShell>
  );
}
