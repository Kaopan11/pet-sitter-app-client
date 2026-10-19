"use client";

import { createContext } from "react";

// Avoid refetching the sitter on every tab — layout loads once, tabs read this.
export const SitterDetailContext = createContext(null);

export function SitterDetailProvider({ sitter, children }) {
  return (
    <SitterDetailContext.Provider value={sitter}>
      {children}
    </SitterDetailContext.Provider>
  );
}
