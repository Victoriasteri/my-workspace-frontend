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
  Popover,
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
  onTodoUpdate?: (updatedTodo: Todo) => void;
}

export const TodoViewDialog: React.FC<TodoViewDialogProps> = ({
  open,
  onClose,
  todo,
  onEdit,
  onTodoUpdate,
}) => {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingItemIds, setPendingItemIds] = useState<Set<string>>(new Set());
  const [deleteAnchorEl, setDeleteAnchorEl] =
    useState<HTMLButtonElement | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
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

  // Helper function to update parent component with current todo state
  const updateParentTodo = useCallback(() => {
    if (!todo || !onTodoUpdate) return;

    const updatedTodo: Todo = {
      ...todo,
      items: items,
    };
    onTodoUpdate(updatedTodo);
  }, [todo, items, onTodoUpdate]);

  useEffect(() => {
    if (open && todo?.id) {
      fetchItems();
      setNewItemText("");
      setIsAddingItem(false);
    }
  }, [open, todo?.id, fetchItems]);

  // Update parent when dialog closes to ensure latest state is reflected
  useEffect(() => {
    if (!open && todo && onTodoUpdate) {
      // Use setTimeout to ensure state updates are complete
      setTimeout(() => {
        updateParentTodo();
      }, 0);
    }
  }, [open, todo, onTodoUpdate, updateParentTodo]);

  if (!todo) return null;

  const handleEdit = () => {
    onEdit(todo);
    onClose();
  };

  const handleAddItem = async () => {
    if (!newItemText.trim() || !todo?.id) return;

    // Create temporary item for optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const tempItem: TodoItem = {
      id: tempId,
      description: newItemText.trim(),
      isCompleted: false,
      todoId: todo.id,
    };

    // Immediately add to UI
    setItems((prev) => [...prev, tempItem]);
    setPendingItemIds((prev) => new Set(prev).add(tempId));
    setNewItemText("");
    setIsAddingItem(false);

    try {
      // Make API call
      const newItem = await todosApi.createTodoItem(todo.id, {
        description: tempItem.description,
        isCompleted: false,
      });

      // Replace temporary item with real item from API
      setItems((prev) => {
        const updated = prev.map((item) =>
          item.id === tempId ? newItem : item
        );
        // Update parent component
        setTimeout(() => {
          if (todo && onTodoUpdate) {
            onTodoUpdate({ ...todo, items: updated });
          }
        }, 0);
        return updated;
      });
      setPendingItemIds((prev) => {
        const updated = new Set(prev);
        updated.delete(tempId);
        return updated;
      });
      showNotification("Item added successfully", "success");
    } catch (error) {
      console.error("Error adding todo item:", error);
      // Remove temporary item on error
      setItems((prev) => {
        const updated = prev.filter((item) => item.id !== tempId);
        // Update parent component even on error (to remove the failed item)
        setTimeout(() => {
          if (todo && onTodoUpdate) {
            onTodoUpdate({ ...todo, items: updated });
          }
        }, 0);
        return updated;
      });
      setPendingItemIds((prev) => {
        const updated = new Set(prev);
        updated.delete(tempId);
        return updated;
      });
      showNotification("Failed to add item", "error");
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (!todo?.id) return;

    // Prevent toggling pending items
    if (pendingItemIds.has(itemId)) return;

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // STEP 1: Update local state IMMEDIATELY using functional update
    const newCompletedStatus = !item.isCompleted;

    // Update state immediately - this should trigger immediate re-render
    let updatedItems: TodoItem[] = [];
    setItems((prev) => {
      updatedItems = prev.map((i) =>
        i.id === itemId ? { ...i, isCompleted: newCompletedStatus } : i
      );
      return updatedItems;
    });

    // Update parent component after state update (defer to avoid blocking)
    if (onTodoUpdate && todo) {
      setTimeout(() => {
        onTodoUpdate({ ...todo, items: updatedItems });
      }, 0);
    }

    // STEP 2: Call API AFTER state is updated
    try {
      const updatedItem = await todosApi.updateTodoItem(todo.id, itemId, {
        isCompleted: newCompletedStatus,
      });

      // Replace optimistic update with real API response
      setItems((prev) => {
        const finalItems = prev.map((i) => (i.id === itemId ? updatedItem : i));
        if (onTodoUpdate && todo) {
          onTodoUpdate({ ...todo, items: finalItems });
        }
        return finalItems;
      });
    } catch (error) {
      console.error("Error updating todo item:", error);
      // Revert optimistic update on error
      setItems((prev) => {
        const revertedItems = prev.map((i) => (i.id === itemId ? item : i));
        if (onTodoUpdate && todo) {
          onTodoUpdate({ ...todo, items: revertedItems });
        }
        return revertedItems;
      });
      showNotification("Failed to update item", "error");
    }
  };

  const handleDeleteClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    itemId: string
  ) => {
    event.stopPropagation();
    // Prevent deleting pending items
    if (pendingItemIds.has(itemId)) return;
    setDeleteAnchorEl(event.currentTarget);
    setPendingDeleteId(itemId);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId || !todo?.id) {
      handleDeleteCancel();
      return;
    }

    try {
      await todosApi.deleteTodoItem(todo.id, pendingDeleteId);
      setItems((prev) => {
        const updated = prev.filter((item) => item.id !== pendingDeleteId);
        // Update parent component
        if (onTodoUpdate) {
          setTimeout(() => {
            if (todo) {
              onTodoUpdate({ ...todo, items: updated });
            }
          }, 0);
        }
        return updated;
      });
      showNotification("Item deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting todo item:", error);
      showNotification("Failed to delete item", "error");
    } finally {
      handleDeleteCancel();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteAnchorEl(null);
    setPendingDeleteId(null);
  };

  const deletePopoverOpen = Boolean(deleteAnchorEl);

  const handleUpdateItemText = async (itemId: string, newText: string) => {
    if (!todo?.id) return;

    if (!newText.trim()) {
      // If text is empty, delete the item
      try {
        await todosApi.deleteTodoItem(todo.id, itemId);
        setItems((prev) => {
          const updated = prev.filter((item) => item.id !== itemId);
          // Update parent component
          if (onTodoUpdate) {
            setTimeout(() => {
              if (todo) {
                onTodoUpdate({ ...todo, items: updated });
              }
            }, 0);
          }
          return updated;
        });
        showNotification("Item deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting todo item:", error);
        showNotification("Failed to delete item", "error");
      }
      return;
    }

    try {
      const updatedItem = await todosApi.updateTodoItem(todo.id, itemId, {
        description: newText.trim(),
      });
      setItems((prev) => {
        const updated = prev.map((item) =>
          item.id === itemId ? updatedItem : item
        );
        // Update parent component
        if (onTodoUpdate) {
          setTimeout(() => {
            if (todo) {
              onTodoUpdate({ ...todo, items: updated });
            }
          }, 0);
        }
        return updated;
      });
      showNotification("Item updated successfully", "success");
    } catch (error) {
      console.error("Error updating todo item:", error);
      showNotification("Failed to update item", "error");
    }
  };

  const completedCount = items.filter((item) => item.isCompleted).length;
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
                      isPending={pendingItemIds.has(item.id!)}
                      onToggle={() => handleToggleItem(item.id!)}
                      onDelete={(e) => handleDeleteClick(e, item.id!)}
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
      <Popover
        open={deletePopoverOpen}
        anchorEl={deleteAnchorEl}
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
            Delete this item?
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
    </>
  );
};

interface TodoItemComponentProps {
  item: TodoItem;
  isPending?: boolean;
  onToggle: () => void;
  onDelete: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onUpdateText: (newText: string) => void;
}

const TodoItemComponent: React.FC<TodoItemComponentProps> = ({
  item,
  isPending = false,
  onToggle,
  onDelete,
  onUpdateText,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.description);
  // Local state for immediate checkbox feedback
  const [localCompleted, setLocalCompleted] = useState(item.isCompleted);

  useEffect(() => {
    setEditText(item.description);
  }, [item.description]);

  useEffect(() => {
    setLocalCompleted(item.isCompleted);
  }, [item.isCompleted]);

  const handleToggle = () => {
    // Update local state immediately for instant UI feedback
    setLocalCompleted(!localCompleted);
    // Then call the parent handler
    onToggle();
  };

  const handleSave = () => {
    onUpdateText(editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(item.description);
    setIsEditing(false);
  };

  return (
    <ListItem
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        mb: 1,
        opacity: isPending ? 0.6 : 1,
        pointerEvents: isPending ? "none" : "auto",
        position: "relative",
        "&:hover": {
          backgroundColor: isPending ? "transparent" : "#f5f5f5",
        },
      }}
    >
      {isPending && (
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
            bgcolor: "rgba(255, 255, 255, 0.7)",
            zIndex: 1,
            borderRadius: 1,
          }}
        >
          <CircularProgress size={20} />
        </Box>
      )}
      <ListItemIcon>
        <Checkbox
          checked={localCompleted}
          onChange={handleToggle}
          edge="start"
          disabled={isPending}
        />
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
            primary={item.description}
            onClick={() => !isPending && setIsEditing(true)}
            sx={{
              cursor: isPending ? "default" : "pointer",
              textDecoration: item.isCompleted ? "line-through" : "none",
              color: item.isCompleted ? "text.secondary" : "text.primary",
              "&:hover": {
                backgroundColor: isPending ? "transparent" : "#f0f0f0",
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
            disabled={isPending}
          >
            <DeleteIcon />
          </IconButton>
        </>
      )}
    </ListItem>
  );
};
