"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { NoteForm } from "@/modules/notes/components/NoteForm";
import { NotesList } from "@/modules/notes/components/NotesList";
import { NoteViewDialog } from "@/modules/notes/components/NoteViewDialog";
import { notesApi } from "@/services/api";
import { Note, CreateNoteDto, UpdateNoteDto, Attachment } from "@/types/note";
import { ModuleLayout } from "@/components/shared/ModuleLayout";
import { useNotification } from "@/components/shared/useNotification";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

function NotesPageContent() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { notification, showNotification, hideNotification } =
    useNotification();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await notesApi.getAllNotes();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      showNotification("Failed to fetch notes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateNote = async (noteData: CreateNoteDto): Promise<Note> => {
    setApiLoading(true);
    setLoadingMessage("Creating note...");
    try {
      const createdNote = await notesApi.createNote(noteData);
      setNotes((prev) => [createdNote, ...prev]);
      showNotification("Note created successfully", "success");
      return createdNote;
    } catch (error) {
      console.error("Error creating note:", error);
      showNotification("Failed to create note", "error");
      throw error;
    } finally {
      setApiLoading(false);
      setLoadingMessage(undefined);
    }
  };

  const handleUpdateNote = async (noteData: UpdateNoteDto) => {
    if (!editingNote?.id) return;

    setApiLoading(true);
    setLoadingMessage("Updating note...");
    try {
      const updatedNote = await notesApi.updateNote(editingNote.id, noteData);
      setNotes((prev) =>
        prev.map((note) => (note.id === editingNote.id ? updatedNote : note))
      );
      // Update viewing note if it's the same one
      if (viewingNote?.id === editingNote.id) {
        setViewingNote(updatedNote);
      }
      showNotification("Note updated successfully", "success");
      setEditingNote(null);
    } catch (error) {
      console.error("Error updating note:", error);
      showNotification("Failed to update note", "error");
      throw error;
    } finally {
      setApiLoading(false);
      setLoadingMessage(undefined);
    }
  };

  const handleDeleteNote = async (id: string) => {
    setApiLoading(true);
    setLoadingMessage("Deleting note...");
    try {
      await notesApi.deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      // Close view dialog if the deleted note is being viewed
      if (viewingNote?.id === id) {
        setViewDialogOpen(false);
        setViewingNote(null);
      }
      showNotification("Note deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting note:", error);
      showNotification("Failed to delete note", "error");
    } finally {
      setApiLoading(false);
      setLoadingMessage(undefined);
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setFormOpen(true);
  };

  const handleCardClick = (note: Note) => {
    setViewingNote(note);
    setViewDialogOpen(true);
  };

  const handleViewDialogClose = () => {
    setViewDialogOpen(false);
    setViewingNote(null);
  };

  const handleFetchAttachments = async (
    noteId: string
  ): Promise<Attachment[]> => {
    try {
      return await notesApi.getNoteAttachments(noteId);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      showNotification("Failed to fetch attachments", "error");
      return [];
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingNote(null);
  };

  const handleFormSubmit = async (
    noteData: CreateNoteDto | UpdateNoteDto
  ): Promise<Note | void> => {
    if (editingNote) {
      await handleUpdateNote(noteData as UpdateNoteDto);
    } else {
      return await handleCreateNote(noteData as CreateNoteDto);
    }
  };

  const handleUploadAttachment = async (noteId: string, file: File) => {
    setApiLoading(true);
    setLoadingMessage("Uploading attachment...");
    try {
      await notesApi.uploadAttachment(noteId, file);
      // Update the note's attachmentIds count locally
      setNotes((prev) =>
        prev.map((note) => {
          if (note.id === noteId) {
            return {
              ...note,
              attachmentIds: [...(note.attachmentIds || []), "temp-id"], // Temporary ID, will be updated on next fetch if needed
            };
          }
          return note;
        })
      );
      showNotification("Attachment uploaded successfully", "success");
    } catch (error) {
      console.error("Error uploading attachment:", error);
      showNotification("Failed to upload attachment", "error");
      throw error;
    } finally {
      setApiLoading(false);
      setLoadingMessage(undefined);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    setApiLoading(true);
    setLoadingMessage("Deleting attachment...");
    try {
      await notesApi.deleteAttachment(attachmentId);
      // Update the note's attachmentIds count locally
      if (editingNote?.id) {
        setNotes((prev) =>
          prev.map((note) => {
            if (note.id === editingNote.id) {
              return {
                ...note,
                attachmentIds: (note.attachmentIds || []).slice(0, -1),
              };
            }
            return note;
          })
        );
      }
      showNotification("Attachment deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting attachment:", error);
      showNotification("Failed to delete attachment", "error");
      throw error;
    } finally {
      setApiLoading(false);
      setLoadingMessage(undefined);
    }
  };

  const actionButton = (
    <Button
      color="inherit"
      startIcon={<AddIcon />}
      onClick={() => setFormOpen(true)}
    >
      New Note
    </Button>
  );

  return (
    <ModuleLayout
      title="My Notes"
      actionButton={actionButton}
      notification={notification}
      onNotificationClose={hideNotification}
    >
      <NotesList
        notes={notes}
        onEdit={handleEditClick}
        onDelete={handleDeleteNote}
        onClick={handleCardClick}
        loading={loading}
        onCreateNew={() => setFormOpen(true)}
      />

      <NoteViewDialog
        open={viewDialogOpen}
        onClose={handleViewDialogClose}
        note={viewingNote}
        onEdit={handleEditClick}
        onFetchAttachments={handleFetchAttachments}
      />

      <NoteForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        onUploadAttachment={handleUploadAttachment}
        onFetchAttachments={handleFetchAttachments}
        onDeleteAttachment={handleDeleteAttachment}
        note={editingNote}
        mode={editingNote ? "edit" : "create"}
      />

      <LoadingOverlay open={apiLoading} message={loadingMessage} />
    </ModuleLayout>
  );
}

export default function NotesPage() {
  return (
    <ProtectedRoute>
      <NotesPageContent />
    </ProtectedRoute>
  );
}
