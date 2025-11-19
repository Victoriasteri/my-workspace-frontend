"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Todo, TodoItem } from "@/types/todo";
import { formatDate } from "@/utils/date";
import { todosApi } from "@/services/api";
import { useNotification } from "@/components/shared/useNotification";
import { NotificationSnackbar } from "@/components/shared/NotificationSnackbar";

interface TodoViewDialogProps {
  open: boolean;
  onClose: () => void;
  todo: Todo | null;
  onEdit: (todo: Todo) => void;
}

export const TodoViewDialog: React.FC<TodoViewDialogProps> = ({
  open,
  onClose,
  todo,
  onEdit,
}) => {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const { notification, showNotification, hideNotification } =
    useNotification();

  const fetchItems = useCallback(async () => {
    if (!todo?.id) return;

    try {
      setLoading(true);
      const fetchedItems = await todosApi.getTodoItems(todo.id);
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching todo items:", error);
      showNotification("Failed to load todo items", "error");
    } finally {
      setLoading(false);
    }
  }, [todo?.id, showNotification]);

  useEffect(() => {
    if (open && todo?.id) {
      fetchItems();
      setNewItemText("");
      setIsAddingItem(false);
    }
  }, [open, todo?.id, fetchItems]);

  if (!todo) return null;

  const handleEdit = () => {
    onEdit(todo);
    onClose();
  };

  const handleAddItem = async () => {
    if (!newItemText.trim() || !todo?.id) return;

    try {
      const newItem = await todosApi.createTodoItem(todo.id, {
        text: newItemText.trim(),
      });
      setItems((prev) => [...prev, newItem]);
      setNewItemText("");
      setIsAddingItem(false);
      showNotification("Item added successfully", "success");
    } catch (error) {
      console.error("Error adding todo item:", error);
      showNotification("Failed to add item", "error");
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (!todo?.id) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    try {
      const updatedItem = await todosApi.updateTodoItem(todo.id, itemId, {
        completed: !item.completed,
      });
      setItems((prev) => prev.map((i) => (i.id === itemId ? updatedItem : i)));
    } catch (error) {
      console.error("Error updating todo item:", error);
      showNotification("Failed to update item", "error");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!todo?.id) return;

    try {
      await todosApi.deleteTodoItem(todo.id, itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      showNotification("Item deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting todo item:", error);
      showNotification("Failed to delete item", "error");
    }
  };

  const handleUpdateItemText = async (itemId: string, newText: string) => {
    if (!todo?.id) return;

    if (!newText.trim()) {
      await handleDeleteItem(itemId);
      return;
    }

    try {
      const updatedItem = await todosApi.updateTodoItem(todo.id, itemId, {
        text: newText.trim(),
      });
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? updatedItem : item))
      );
      showNotification("Item updated successfully", "success");
    } catch (error) {
      console.error("Error updating todo item:", error);
      showNotification("Failed to update item", "error");
    }
  };

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: todo.color || "#000000",
                  borderRadius: "4px",
                }}
              />
              <Typography variant="h6">{todo.title}</Typography>
            </Box>
            <Box>
              <IconButton
                onClick={handleEdit}
                color="primary"
                aria-label="edit todo"
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Chip
                label={`${completedCount}/${totalCount} completed`}
                color={
                  totalCount > 0 && completedCount === totalCount
                    ? "success"
                    : "default"
                }
                variant="outlined"
              />
              {todo.createdAt && (
                <Typography variant="caption" color="text.secondary">
                  Created: {formatDate(todo.createdAt)}
                </Typography>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Todo Items
              </Typography>

              {!isAddingItem && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddingItem(true)}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                >
                  Add Item
                </Button>
              )}

              {isAddingItem && (
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter todo item..."
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem();
                      } else if (e.key === "Escape") {
                        setIsAddingItem(false);
                        setNewItemText("");
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddItem}
                    disabled={!newItemText.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsAddingItem(false);
                      setNewItemText("");
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}

              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 4,
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              ) : items.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 2 }}
                >
                  No items yet. Click "Add Item" to get started!
                </Typography>
              ) : (
                <List>
                  {items.map((item) => (
                    <TodoItemComponent
                      key={item.id}
                      item={item}
                      onToggle={() => handleToggleItem(item.id!)}
                      onDelete={() => handleDeleteItem(item.id!)}
                      onUpdateText={(newText) =>
                        handleUpdateItemText(item.id!, newText)
                      }
                    />
                  ))}
                </List>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            startIcon={<EditIcon />}
          >
            Edit List
          </Button>
        </DialogActions>
      </Dialog>
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={hideNotification}
      />
    </>
  );
};

interface TodoItemComponentProps {
  item: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
  onUpdateText: (newText: string) => void;
}

const TodoItemComponent: React.FC<TodoItemComponentProps> = ({
  item,
  onToggle,
  onDelete,
  onUpdateText,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);

  useEffect(() => {
    setEditText(item.text);
  }, [item.text]);

  const handleSave = () => {
    onUpdateText(editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(item.text);
    setIsEditing(false);
  };

  return (
    <ListItem
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        mb: 1,
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      }}
    >
      <ListItemIcon>
        <Checkbox checked={item.completed} onChange={onToggle} edge="start" />
      </ListItemIcon>
      {isEditing ? (
        <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSave();
              } else if (e.key === "Escape") {
                handleCancel();
              }
            }}
            autoFocus
          />
          <Button size="small" onClick={handleSave} variant="contained">
            Save
          </Button>
          <Button size="small" onClick={handleCancel} variant="outlined">
            Cancel
          </Button>
        </Box>
      ) : (
        <>
          <ListItemText
            primary={item.text}
            onClick={() => setIsEditing(true)}
            sx={{
              cursor: "pointer",
              textDecoration: item.completed ? "line-through" : "none",
              color: item.completed ? "text.secondary" : "text.primary",
              "&:hover": {
                backgroundColor: "#f0f0f0",
                borderRadius: 1,
                px: 1,
              },
            }}
          />
          <IconButton
            edge="end"
            onClick={onDelete}
            color="error"
            size="small"
            aria-label="delete item"
          >
            <DeleteIcon />
          </IconButton>
        </>
      )}
    </ListItem>
  );
};
