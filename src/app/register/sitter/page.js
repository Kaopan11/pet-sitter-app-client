import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/RegisterForm";

export const metadata = {
  title: "Pet Sitter Register | Pet Sitter App",
};

// /register/sitter — สมัครเป็น pet_sitter
export default function SitterRegisterPage() {
  return (
    <AuthShell variant="plain">
      <RegisterForm
        title="Join Us"
        subtitle="Become the best Pet Sitter with us"
        role="pet_sitter"
        loginHref="/login/sitter"
        loginPrompt="Already have Pet Sitter account?"
        showName
      />
    </AuthShell>
  );
}
