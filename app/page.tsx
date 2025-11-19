"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to notes by default
    router.push("/notes");
  }, [router]);

  return null;
}
