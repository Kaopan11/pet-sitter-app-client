import { redirect } from "next/navigation";

// src/app/register — หน้าสมัครสมาชิก
// /register → ส่งต่อไป owner
export default function RegisterIndexPage() {
  redirect("/register/owner");
}
