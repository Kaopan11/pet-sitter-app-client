import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  // Default landing after admin login.
  redirect("/admin/pet-sitter");
}
