import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/RegisterForm";

export const metadata = {
  title: "Register | Pet Sitter App",
};

// /register/owner — สมัครเป็น pet_owner
export default function OwnerRegisterPage() {
  return (
    <AuthShell variant="light">
      <RegisterForm
        title="Join Us!"
        subtitle="Find your perfect pet sitter with us"
        role="pet_owner"
        loginHref="/login/owner"
        loginPrompt="Already have an account?"
        showName
        showSocial
      />
    </AuthShell>
  );
}
