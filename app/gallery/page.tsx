"use client";

import React from "react";
import { ModuleLayout } from "@/components/shared/ModuleLayout";
import { EmptyState } from "@/components/shared/EmptyState";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";

export default function GalleryPage() {
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
