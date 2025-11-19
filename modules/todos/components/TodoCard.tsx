"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChecklistIcon from "@mui/icons-material/Checklist";
import { Todo } from "@/types/todo";
import { formatDate } from "@/utils/date";

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onClick?: (todo: Todo) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onEdit,
  onDelete,
  onClick,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(todo.id!);
    setDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(todo);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(todo);
    }
  };

  const itemCount = todo.items?.length || 0;
  const completedCount =
    todo.items?.filter((item) => item.isCompleted).length || 0;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: onClick ? "pointer" : "default",
        borderLeft: `4px solid ${todo.color || "#000000"}`,
        "&:hover": onClick
          ? {
              boxShadow: 4,
              transform: "translateY(-2px)",
              transition: "all 0.2s ease-in-out",
            }
          : {},
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <ChecklistIcon sx={{ color: todo.color || "#000000" }} />
          <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
            {todo.title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Chip
            label={`${completedCount}/${itemCount} completed`}
            size="small"
            color={
              itemCount > 0 && completedCount === itemCount
                ? "success"
                : "default"
            }
            variant="outlined"
          />
        </Box>

        {todo.createdAt && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            Created: {formatDate(todo.createdAt)}
          </Typography>
        )}
      </CardContent>
      <CardActions>
        <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
          <IconButton
            color="primary"
            onClick={handleEdit}
            aria-label="edit todo"
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={handleDeleteClick}
            aria-label="delete todo"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardActions>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Delete Todo List</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{todo.title}"? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
