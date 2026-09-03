"use client";

import { createContext } from "react";

export const SitterDetailContext = createContext(null);

export function SitterDetailProvider({ sitter, children }) {
  return (
    <SitterDetailContext.Provider value={sitter}>
      {children}
    </SitterDetailContext.Provider>
  );
}
