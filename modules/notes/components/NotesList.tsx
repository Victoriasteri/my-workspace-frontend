"use client";

import React from "react";
import { Grid } from "@mui/material";
import { NoteCard } from "./NoteCard";
import { Note } from "@/types/note";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import NotesIcon from "@mui/icons-material/Notes";

interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onClick?: (note: Note) => void;
  loading?: boolean;
  onCreateNew?: () => void;
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  onEdit,
  onDelete,
  onClick,
  loading = false,
  onCreateNew,
}) => {
  if (loading) {
    return <LoadingSpinner message="Loading notes..." />;
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        title="No notes yet"
        description="Create your first note to get started!"
        actionLabel="Create Note"
        onAction={onCreateNew}
        icon={<NotesIcon />}
      />
    );
  }

  return (
    <Grid container spacing={3}>
      {notes.map((note) => (
        <Grid item xs={12} sm={6} md={4} key={note.id}>
          <NoteCard
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
            onClick={onClick}
          />
        </Grid>
      ))}
    </Grid>
  );
};
