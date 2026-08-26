"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import SitterLayout from "../sitter/layout";
import { getUser } from "@/lib/auth";

export default function MessagesLayout({ children }) {
  const [shell, setShell] = useState("pending");

  useEffect(() => {
    setShell(getUser()?.isSitter ? "sitter" : "owner");
  }, []);

  if (shell === "pending") {
    return <div className="h-screen bg-white" />;
  }

  if (shell === "sitter") {
    return <SitterLayout precheckedSitter>{children}</SitterLayout>;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <div className="hidden md:block">
        <Navbar />
      </div>
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
