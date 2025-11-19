"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Alert,
  CircularProgress,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { Note, CreateNoteDto, UpdateNoteDto, Attachment } from "@/types/note";
import { AttachmentDisplay } from "./AttachmentDisplay";
import { notesApi } from "@/services/api";

export const ALLOWED_NOTES_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

interface NoteFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (note: CreateNoteDto | UpdateNoteDto) => Promise<Note | void>;
  onUploadAttachment?: (noteId: string, file: File) => Promise<void>;
  onFetchAttachments?: (noteId: string) => Promise<Attachment[]>;
  onDeleteAttachment?: (attachmentId: string) => Promise<void>;
  note?: Note | null;
  mode: "create" | "edit";
}

export const NoteForm: React.FC<NoteFormProps> = ({
  open,
  onClose,
  onSubmit,
  onUploadAttachment,
  onFetchAttachments,
  onDeleteAttachment,
  note,
  mode,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
    []
  );
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>(
    {}
  );

  useEffect(() => {
    if (mode === "edit" && note) {
      setTitle(note.title);
      setContent(note.content);

      // Fetch existing attachments when editing
      if (note.id && onFetchAttachments) {
        setLoadingAttachments(true);
        onFetchAttachments(note.id)
          .then((attachments) => {
            setExistingAttachments(attachments);
          })
          .catch((error) => {
            console.error("Error fetching attachments:", error);
            setExistingAttachments([]);
          })
          .finally(() => {
            setLoadingAttachments(false);
          });
      } else {
        setExistingAttachments([]);
      }
    } else {
      setTitle("");
      setContent("");
      setExistingAttachments([]);
    }
    setSelectedFiles([]);
    setUploadingFiles(new Set());
    setFileErrors([]);
    setErrors({});
  }, [open, note, mode, onFetchAttachments]);

  const validate = (): boolean => {
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach((file) => {
      if (ALLOWED_NOTES_FILE_TYPES.includes(file.type)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setFileErrors([
        ...fileErrors,
        ...invalidFiles.map(
          (name) => `${name} - Only JPEG, PNG, and PDF files are allowed`
        ),
      ]);
    }

    // In edit mode, upload files immediately
    if (
      validFiles.length > 0 &&
      mode === "edit" &&
      note?.id &&
      onUploadAttachment
    ) {
      for (const file of validFiles) {
        setUploadingFiles((prev) => new Set(prev).add(file.name));
        try {
          await onUploadAttachment(note.id, file);
          // File uploaded successfully, refresh existing attachments
          if (onFetchAttachments && note.id) {
            try {
              const refreshedAttachments = await onFetchAttachments(note.id);
              setExistingAttachments(refreshedAttachments);
            } catch (error) {
              console.error("Error refreshing attachments:", error);
            }
          }
        } catch (error) {
          // On error, add to selectedFiles so user can retry on form submit
          setSelectedFiles((prev) => [...prev, file]);
        } finally {
          setUploadingFiles((prev) => {
            const next = new Set(prev);
            next.delete(file.name);
            return next;
          });
        }
      }
    } else if (validFiles.length > 0) {
      // In create mode, add to selectedFiles to upload after note creation
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!note?.id) return;

    setDeletingAttachmentId(attachmentId);

    // Optimistically remove the attachment from the list
    setExistingAttachments((prev) => prev.filter((a) => a.id !== attachmentId));

    try {
      if (onDeleteAttachment) {
        await onDeleteAttachment(attachmentId);
      } else {
        // Fallback to direct API call if handler not provided
        await notesApi.deleteAttachment(attachmentId);
      }

      // Refresh attachments list to ensure consistency
      if (onFetchAttachments && note.id) {
        try {
          const refreshedAttachments = await onFetchAttachments(note.id);
          setExistingAttachments(refreshedAttachments);
        } catch (error) {
          console.error("Error refreshing attachments after deletion:", error);
        }
      }
    } catch (error) {
      console.error("Error deleting attachment:", error);
      // On error, restore the attachment by refetching
      if (onFetchAttachments && note.id) {
        try {
          const refreshedAttachments = await onFetchAttachments(note.id);
          setExistingAttachments(refreshedAttachments);
        } catch (error) {
          console.error("Error restoring attachments:", error);
        }
      }
    } finally {
      setDeletingAttachmentId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const result = await onSubmit({ title, content });

      // Upload attachments if files are selected
      // For create mode, result should be the created note with ID
      // For edit mode, use the existing note ID
      const noteId = mode === "create" && result ? result.id : note?.id;

      if (selectedFiles.length > 0 && onUploadAttachment && noteId) {
        const uploadPromises = selectedFiles.map(async (file) => {
          setUploadingFiles((prev) => new Set(prev).add(file.name));
          try {
            await onUploadAttachment(noteId, file);
          } finally {
            setUploadingFiles((prev) => {
              const next = new Set(prev);
              next.delete(file.name);
              return next;
            });
          }
        });
        await Promise.all(uploadPromises);
      }

      handleClose();
    } catch (error) {
      console.error("Error submitting note:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    setSelectedFiles([]);
    setUploadingFiles(new Set());
    setFileErrors([]);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === "create" ? "Create New Note" : "Edit Note"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              error={!!errors.title}
              helperText={errors.title}
              disabled={loading}
            />
            <TextField
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              required
              multiline
              rows={6}
              error={!!errors.content}
              helperText={errors.content}
              disabled={loading}
            />
            <Box>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                id="file-upload"
                disabled={loading}
              />
              <label htmlFor="file-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  disabled={
                    loading || (mode === "edit" && uploadingFiles.size > 0)
                  }
                  sx={{
                    mb:
                      selectedFiles.length > 0 ||
                      fileErrors.length > 0 ||
                      uploadingFiles.size > 0
                        ? 1
                        : 0,
                  }}
                >
                  Attach Files (JPEG, PNG, PDF)
                </Button>
              </label>
              {fileErrors.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  {fileErrors.map((error, index) => (
                    <Alert
                      key={index}
                      severity="error"
                      onClose={() => {
                        setFileErrors((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                      sx={{ mb: 1 }}
                    >
                      {error}
                    </Alert>
                  ))}
                </Box>
              )}
              {/* Show existing attachments when editing */}
              {mode === "edit" && (
                <Box
                  sx={{
                    mt: 1,
                    maxHeight:
                      loadingAttachments || existingAttachments.length > 0
                        ? "1000px"
                        : "0px",
                    transition:
                      "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out",
                    opacity:
                      loadingAttachments || existingAttachments.length > 0
                        ? 1
                        : 0,
                    overflow: "hidden",
                  }}
                >
                  {loadingAttachments ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 1,
                      }}
                    >
                      <CircularProgress size={16} />
                      <Typography variant="caption" color="text.secondary">
                        Loading attachments...
                      </Typography>
                    </Box>
                  ) : existingAttachments.length > 0 ? (
                    <Box
                      sx={{
                        transition: "opacity 0.2s ease-in-out",
                        opacity: deletingAttachmentId ? 0.7 : 1,
                      }}
                    >
                      <AttachmentDisplay
                        attachments={existingAttachments}
                        showDelete={true}
                        onDelete={handleDeleteAttachment}
                        deletingAttachmentId={deletingAttachmentId}
                      />
                    </Box>
                  ) : null}
                </Box>
              )}

              <Box
                sx={{
                  mt: 1,
                  maxHeight:
                    selectedFiles.length > 0 || uploadingFiles.size > 0
                      ? "1000px"
                      : "0px",
                  transition:
                    "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out",
                  opacity:
                    selectedFiles.length > 0 || uploadingFiles.size > 0 ? 1 : 0,
                  overflow: "hidden",
                }}
              >
                {selectedFiles.length > 0 && (
                  <Box
                    sx={{
                      transition: "opacity 0.2s ease-in-out",
                      opacity: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 1, display: "block" }}
                    >
                      Selected files ({selectedFiles.length}) - will be uploaded
                      on save
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      {selectedFiles.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            p: 1,
                            bgcolor: "action.hover",
                            borderRadius: 1,
                          }}
                        >
                          <AttachFileIcon fontSize="small" color="action" />
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {file.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatFileSize(file.size)}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveFile(index)}
                            disabled={loading}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                {uploadingFiles.size > 0 && (
                  <Box
                    sx={{
                      mt: selectedFiles.length > 0 ? 1 : 0,
                      transition: "opacity 0.2s ease-in-out",
                      opacity: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <CircularProgress size={16} />
                      <Typography variant="caption" color="text.secondary">
                        {mode === "edit"
                          ? `Uploading ${uploadingFiles.size} file${
                              uploadingFiles.size > 1 ? "s" : ""
                            }...`
                          : "Uploading files..."}
                      </Typography>
                    </Box>
                    <LinearProgress />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
