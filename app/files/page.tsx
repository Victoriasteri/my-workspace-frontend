"use client";

import React from "react";
import { ModuleLayout } from "@/components/shared/ModuleLayout";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import FolderIcon from "@mui/icons-material/Folder";

function FilesPageContent() {
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

export default function FilesPage() {
  return (
    <ProtectedRoute>
      <FilesPageContent />
    </ProtectedRoute>
  );
}
