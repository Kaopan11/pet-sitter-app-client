import { redirect } from "next/navigation";

// /login → หน้า owner
export default function LoginIndexPage() {
  redirect("/login/owner");
}
