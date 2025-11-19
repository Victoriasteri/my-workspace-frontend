"use client";

import React from "react";
import { ThemeRegistry } from "./ThemeRegistry";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <ConfigProvider>
        <AuthProvider>{children}</AuthProvider>
      </ConfigProvider>
    </ThemeRegistry>
  );
}
