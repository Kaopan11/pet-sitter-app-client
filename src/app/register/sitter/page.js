import { redirect } from "next/navigation";

// ลิงก์เก่า → หน้าสมัครรวม
export default function SitterRegisterRedirect() {
  redirect("/register");
}
