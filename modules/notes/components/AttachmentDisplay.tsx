"use client";

import React, { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Paper,
  Stack,
  Popover,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  AttachFile,
  Image as ImageIcon,
  PictureAsPdf,
  InsertDriveFile,
  Delete as DeleteIcon,
  Visibility,
} from "@mui/icons-material";
import { Attachment } from "@/types/note";

interface AttachmentDisplayProps {
  attachments: Attachment[];
  onDelete?: (attachmentId: string) => void;
  onDownload?: (attachment: Attachment) => void;
  showDelete?: boolean;
  deletingAttachmentId?: string | null;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon color="primary" />;
  } else if (mimeType === "application/pdf") {
    return <PictureAsPdf color="action" />;
  }
  return <InsertDriveFile />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatFileName = (fileName: string): string => {
  // Remove UUID prefix (first 37 characters including the separator)
  if (fileName.length > 37) {
    return fileName.substring(37);
  }
  return fileName;
};

export const AttachmentDisplay: React.FC<AttachmentDisplayProps> = ({
  attachments,
  onDelete,
  onDownload,
  showDelete = false,
  deletingAttachmentId: deletingAttachmentIdProp = null,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [localDeletingAttachmentId, setLocalDeletingAttachmentId] = useState<
    string | null
  >(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Use prop if provided, otherwise use local state
  const deletingAttachmentId =
    deletingAttachmentIdProp ?? localDeletingAttachmentId;

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleDownload = (attachment: Attachment) => {
    if (onDownload) {
      onDownload(attachment);
    } else {
      // Handle both absolute and relative URLs
      const url = attachment.url.startsWith("http")
        ? attachment.url
        : `http://localhost:3000${attachment.url}`;
      window.open(url, "_blank");
    }
  };

  const handleDeleteClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    attachmentId: string
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setPendingDeleteId(attachmentId);
    // Don't set deleting state here - only when user confirms
  };

  const handleDeleteConfirm = () => {
    if (pendingDeleteId && onDelete) {
      // Set deleting state only when confirming
      if (!deletingAttachmentIdProp) {
        setLocalDeletingAttachmentId(pendingDeleteId);
      }
      onDelete(pendingDeleteId);
    }
    handleDeleteCancel();
  };

  const handleDeleteCancel = () => {
    setAnchorEl(null);
    setPendingDeleteId(null);
    if (!deletingAttachmentIdProp) {
      setLocalDeletingAttachmentId(null);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
      >
        <AttachFile sx={{ fontSize: 16 }} />
        Attachments ({attachments.length})
      </Typography>
      <Stack direction="column" spacing={1}>
        {attachments.map((attachment) => {
          const isDeleting = deletingAttachmentId === attachment.id;
          return (
            <Paper
              key={attachment.id}
              data-attachment-id={attachment.id}
              elevation={1}
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
                opacity: isDeleting ? 0.6 : 1,
                pointerEvents: isDeleting ? "none" : "auto",
                position: "relative",
                "&:hover": {
                  elevation: isDeleting ? 1 : 2,
                  backgroundColor: isDeleting ? "transparent" : "action.hover",
                },
              }}
            >
              {isDeleting && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    zIndex: 1,
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {getFileIcon(attachment.mimeType)}
              </Box>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Tooltip title={attachment.fileName}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatFileName(attachment.fileName)}
                  </Typography>
                </Tooltip>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(attachment.size)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Tooltip title="View">
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(attachment)}
                    sx={{ p: 0.5 }}
                    disabled={isDeleting}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
                {showDelete && (
                  <Tooltip title={isDeleting ? "Deleting..." : "Delete"}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        if (onDelete && !isDeleting) {
                          handleDeleteClick(e, attachment.id);
                        }
                      }}
                      color="error"
                      sx={{ p: 0.5 }}
                      disabled={!onDelete || isDeleting}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Paper>
          );
        })}
      </Stack>
      {showDelete && onDelete && (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleDeleteCancel}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <Box sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Delete this attachment?
            </Typography>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                size="small"
                onClick={handleDeleteCancel}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                size="small"
                onClick={handleDeleteConfirm}
                color="error"
                variant="contained"
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Popover>
      )}
    </Box>
  );
};
