"use client";

import React from "react";
import { ModuleLayout } from "@/components/shared/ModuleLayout";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";

function GalleryPageContent() {
  return (
    <ModuleLayout title="My Gallery">
      <EmptyState
        title="My Gallery"
        description="Gallery management coming soon..."
        icon={<PhotoLibraryIcon />}
      />
    </ModuleLayout>
  );
}

export default function GalleryPage() {
  return (
    <ProtectedRoute>
      <GalleryPageContent />
    </ProtectedRoute>
  );
}
