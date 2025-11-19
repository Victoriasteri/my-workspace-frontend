"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

function HomeContent() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to notes by default
    router.push("/notes");
  }, [router]);

  return null;
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
