"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Note, Attachment } from "@/types/note";
import { AttachmentDisplay } from "./AttachmentDisplay";
import { formatDate } from "@/utils/date";

interface NoteViewDialogProps {
  open: boolean;
  onClose: () => void;
  note: Note | null;
  onEdit: (note: Note) => void;
  onFetchAttachments?: (noteId: string) => Promise<Attachment[]>;
}

export const NoteViewDialog: React.FC<NoteViewDialogProps> = ({
  open,
  onClose,
  note,
  onEdit,
  onFetchAttachments,
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const hasFetchedRef = useRef<string | null>(null);

  const fetchAttachments = useCallback(
    async (noteId: string, forceRetry = false) => {
      if (!onFetchAttachments) return;

      // Prevent loops: only fetch once per note unless manually retrying
      if (!forceRetry && hasFetchedRef.current === noteId) {
        return;
      }

      setLoadingAttachments(true);
      setAttachmentError(null);
      hasFetchedRef.current = noteId;

      try {
        const fetchedAttachments = await onFetchAttachments(noteId);
        setAttachments(fetchedAttachments);
        setAttachmentError(null);
      } catch (error) {
        console.error("Error fetching attachments:", error);
        setAttachments([]);
        setAttachmentError(
          error instanceof Error
            ? error.message
            : "Failed to load attachments. Please try again."
        );
        // Reset the ref on error so we can retry
        hasFetchedRef.current = null;
      } finally {
        setLoadingAttachments(false);
      }
    },
    [onFetchAttachments]
  );

  useEffect(() => {
    if (open && note?.id) {
      // Reset state when dialog opens with a new note
      if (hasFetchedRef.current !== note.id) {
        setAttachments([]);
        setAttachmentError(null);
        hasFetchedRef.current = null;
      }

      if (note.attachmentIds && note.attachmentIds.length > 0) {
        fetchAttachments(note.id);
      } else {
        setAttachments([]);
        setAttachmentError(null);
        hasFetchedRef.current = note.id;
      }
    } else {
      // Reset when dialog closes
      setAttachments([]);
      setAttachmentError(null);
      hasFetchedRef.current = null;
    }
  }, [open, note?.id, note?.attachmentIds, fetchAttachments]);

  if (!note) return null;

  const handleEdit = () => {
    onEdit(note);
    onClose();
  };

  const handleRetryAttachments = () => {
    if (note?.id) {
      fetchAttachments(note.id, true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">{note.title}</Typography>
          <Box>
            <IconButton
              onClick={handleEdit}
              color="primary"
              aria-label="edit note"
              size="small"
            >
              <EditIcon />
            </IconButton>
            <IconButton onClick={onClose} aria-label="close" size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              minHeight: "100px",
            }}
          >
            {note.content}
          </Typography>

          {(note.attachmentIds && note.attachmentIds.length > 0) ||
          loadingAttachments ||
          attachmentError ||
          attachments.length > 0 ? (
            <Box>
              {loadingAttachments ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : attachmentError ? (
                <Alert
                  severity="error"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={handleRetryAttachments}
                      startIcon={<RefreshIcon />}
                    >
                      Try Again
                    </Button>
                  }
                  sx={{ mb: 2 }}
                >
                  {attachmentError}
                </Alert>
              ) : attachments.length > 0 ? (
                <AttachmentDisplay
                  attachments={attachments}
                  showDelete={false}
                />
              ) : null}
            </Box>
          ) : null}

          {note.createdAt && (
            <Typography variant="caption" color="text.secondary">
              Created: {formatDate(note.createdAt)}
              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <> • Updated: {formatDate(note.updatedAt)}</>
              )}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          onClick={handleEdit}
          variant="contained"
          startIcon={<EditIcon />}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
};
