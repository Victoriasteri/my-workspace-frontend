"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button, Typography, Box, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { TodoForm } from "@/modules/todos/components/TodoForm";
import { TodosList } from "@/modules/todos/components/TodosList";
import { TodoViewDialog } from "@/modules/todos/components/TodoViewDialog";
import { todosApi } from "@/services/api";
import { Todo, CreateTodoDto, UpdateTodoDto } from "@/types/todo";
import { ModuleLayout } from "@/components/shared/ModuleLayout";
import { useNotification } from "@/components/shared/useNotification";
import { LoadingOverlay } from "@/components/shared/LoadingOverlay";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingTodo, setViewingTodo] = useState<Todo | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const { notification, showNotification, hideNotification } =
    useNotification();

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todosApi.getAllTodos();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
      showNotification("Failed to fetch todos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleCreateTodo = async (todoData: CreateTodoDto): Promise<Todo> => {
    setApiLoading(true);
    setLoadingMessage("Creating todo list...");
    try {
      const createdTodo = await todosApi.createTodo(todoData);
      setTodos((prev) => [createdTodo, ...prev]);
      showNotification("Todo list created successfully", "success");
      return createdTodo;
    } catch (error) {
      console.error("Error creating todo:", error);
      showNotification("Failed to create todo list", "error");
      throw error;
    } finally {
      setApiLoading(false);
      setLoadingMessage(undefined);
    }
  };

  const handleUpdateTodo = async (todoData: UpdateTodoDto) => {
    if (!editingTodo?.id) return;

    setApiLoading(true);
    setLoadingMessage("Updating todo list...");
    try {
      const updatedTodo = await todosApi.updateTodo(editingTodo.id, todoData);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === editingTodo.id ? updatedTodo : todo))
      );
      // Update viewing todo if it's the same one
      if (viewingTodo?.id === editingTodo.id) {
        setViewingTodo(updatedTodo);
      }
      showNotification("Todo list updated successfully", "success");
      setEditingTodo(null);
    } catch (error) {
      console.error("Error updating todo:", error);
      showNotification("Failed to update todo list", "error");
      throw error;
    } finally {
      setApiLoading(false);
      setLoadingMessage(undefined);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    setApiLoading(true);
    setLoadingMessage("Deleting todo list...");
    try {
      await todosApi.deleteTodo(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      // Close view dialog if the deleted todo is being viewed
      if (viewingTodo?.id === id) {
        setViewDialogOpen(false);
        setViewingTodo(null);
      }
      showNotification("Todo list deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting todo:", error);
      showNotification("Failed to delete todo list", "error");
    } finally {
      setApiLoading(false);
      setLoadingMessage(undefined);
    }
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setFormOpen(true);
  };

  const handleCardClick = (todo: Todo) => {
    setViewingTodo(todo);
    setViewDialogOpen(true);
  };

  const handleViewDialogClose = () => {
    setViewDialogOpen(false);
    setViewingTodo(null);
  };

  const handleTodoUpdate = (updatedTodo: Todo) => {
    // Update the todo in the list to reflect changes
    setTodos((prev) =>
      prev.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
    );
    // Also update viewingTodo if it's the same one
    if (viewingTodo?.id === updatedTodo.id) {
      setViewingTodo(updatedTodo);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingTodo(null);
  };

  const handleFormSubmit = async (
    todoData: CreateTodoDto | UpdateTodoDto
  ): Promise<Todo | void> => {
    if (editingTodo) {
      await handleUpdateTodo(todoData as UpdateTodoDto);
    } else {
      return await handleCreateTodo(todoData as CreateTodoDto);
    }
  };

  // Helper function to check if a todo is completed
  const isTodoCompleted = (todo: Todo): boolean => {
    if (!todo.items || todo.items.length === 0) return false;
    return todo.items.every((item) => item.isCompleted);
  };

  // Filter todos into completed and in progress
  const { completedTodos, inProgressTodos } = useMemo(() => {
    const completed: Todo[] = [];
    const inProgress: Todo[] = [];

    todos.forEach((todo) => {
      if (isTodoCompleted(todo)) {
        completed.push(todo);
      } else {
        inProgress.push(todo);
      }
    });

    return { completedTodos: completed, inProgressTodos: inProgress };
  }, [todos]);

  const actionButton = (
    <Button
      color="inherit"
      startIcon={<AddIcon />}
      onClick={() => setFormOpen(true)}
    >
      New Todo List
    </Button>
  );

  return (
    <ModuleLayout
      title="My TODOs"
      actionButton={actionButton}
      notification={notification}
      onNotificationClose={hideNotification}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* In Progress Section */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              In Progress
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({inProgressTodos.length})
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {loading ? (
            <TodosList
              todos={[]}
              onEdit={handleEditClick}
              onDelete={handleDeleteTodo}
              onClick={handleCardClick}
              loading={true}
              onCreateNew={() => setFormOpen(true)}
            />
          ) : inProgressTodos.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                No todos in progress. All done! 🎉
              </Typography>
            </Box>
          ) : (
            <TodosList
              todos={inProgressTodos}
              onEdit={handleEditClick}
              onDelete={handleDeleteTodo}
              onClick={handleCardClick}
              loading={false}
              onCreateNew={() => setFormOpen(true)}
            />
          )}
        </Box>

        {/* Completed Section */}
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Completed
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({completedTodos.length})
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {completedTodos.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                No completed todos yet.
              </Typography>
            </Box>
          ) : (
            <TodosList
              todos={completedTodos}
              onEdit={handleEditClick}
              onDelete={handleDeleteTodo}
              onClick={handleCardClick}
              loading={false}
              onCreateNew={() => setFormOpen(true)}
            />
          )}
        </Box>
      </Box>

      <TodoViewDialog
        open={viewDialogOpen}
        onClose={handleViewDialogClose}
        todo={viewingTodo}
        onEdit={handleEditClick}
        onTodoUpdate={handleTodoUpdate}
      />

      <TodoForm
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        todo={editingTodo}
        mode={editingTodo ? "edit" : "create"}
      />

      <LoadingOverlay open={apiLoading} message={loadingMessage} />
    </ModuleLayout>
  );
}
