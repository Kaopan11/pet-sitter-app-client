import { redirect } from "next/navigation";

// src/app/login — หน้าเข้าสู่ระบบ
// /login → ส่งต่อไป owner
export default function LoginIndexPage() {
  redirect("/login/owner");
}
