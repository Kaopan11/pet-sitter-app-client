"use client";

import { Toaster as SonnerToaster } from "sonner";

/** Toast ทั้งแอป — มุมขวาล่าง (ใช้กับ Login error ฯลฯ) */
export default function Toaster() {
  return <SonnerToaster position="bottom-right" closeButton />;
}
