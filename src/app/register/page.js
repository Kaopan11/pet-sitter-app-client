import { redirect } from "next/navigation";

// /register → หน้า owner
export default function RegisterIndexPage() {
  redirect("/register/owner");
}
