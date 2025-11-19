"use client";

import React from "react";
import { ThemeRegistry } from "./ThemeRegistry";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <AuthProvider>{children}</AuthProvider>
    </ThemeRegistry>
  );
}
