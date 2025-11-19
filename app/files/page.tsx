"use client";

import React from "react";
import { ModuleLayout } from "@/components/shared/ModuleLayout";
import { EmptyState } from "@/components/shared/EmptyState";
import FolderIcon from "@mui/icons-material/Folder";

export default function FilesPage() {
  return (
    <ModuleLayout title="My Files">
      <EmptyState
        title="My Files"
        description="File management coming soon..."
        icon={<FolderIcon />}
      />
    </ModuleLayout>
  );
}
