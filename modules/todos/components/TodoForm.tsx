"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Todo, CreateTodoDto, UpdateTodoDto } from "@/types/todo";

const DEFAULT_COLORS = [
  { label: "Black", value: "#000000" },
  { label: "Red", value: "#f44336" },
  { label: "Pink", value: "#e91e63" },
  { label: "Purple", value: "#9c27b0" },
  { label: "Indigo", value: "#3f51b5" },
  { label: "Blue", value: "#2196f3" },
  { label: "Cyan", value: "#00bcd4" },
  { label: "Teal", value: "#009688" },
  { label: "Green", value: "#4caf50" },
  { label: "Lime", value: "#cddc39" },
  { label: "Yellow", value: "#ffeb3b" },
  { label: "Orange", value: "#ff9800" },
];

interface TodoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (todo: CreateTodoDto | UpdateTodoDto) => Promise<Todo | void>;
  todo?: Todo | null;
  mode: "create" | "edit";
}

export const TodoForm: React.FC<TodoFormProps> = ({
  open,
  onClose,
  onSubmit,
  todo,
  mode,
}) => {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#000000");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; color?: string }>({});

  useEffect(() => {
    if (mode === "edit" && todo) {
      setTitle(todo.title);
      setColor(todo.color || "#000000");
    } else {
      setTitle("");
      setColor("#000000");
    }
    setErrors({});
  }, [open, todo, mode]);

  const validate = (): boolean => {
    const newErrors: { title?: string; color?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!color) {
      newErrors.color = "Color is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const todoData: CreateTodoDto | UpdateTodoDto = {
        title: title.trim(),
        color,
      };
      await onSubmit(todoData);
      if (mode === "create") {
        setTitle("");
        setColor("#000000");
      }
      onClose();
    } catch (error) {
      console.error("Error submitting todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === "create" ? "Create Todo List" : "Edit Todo List"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
              required
              disabled={loading}
              autoFocus
            />

            <FormControl fullWidth error={!!errors.color} required>
              <InputLabel>Color</InputLabel>
              <Select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                label="Color"
                disabled={loading}
              >
                {DEFAULT_COLORS.map((colorOption) => (
                  <MenuItem key={colorOption.value} value={colorOption.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: colorOption.value,
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                        }}
                      />
                      <Typography>{colorOption.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.color && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 1.75 }}
                >
                  {errors.color}
                </Typography>
              )}
            </FormControl>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Preview:
              </Typography>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: color,
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {title || "Todo List Title"}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} variant="contained">
            {loading ? "Saving..." : mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
