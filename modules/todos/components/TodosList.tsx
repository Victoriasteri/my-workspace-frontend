"use client";

import React from "react";
import { Grid } from "@mui/material";
import { TodoCard } from "./TodoCard";
import { Todo } from "@/types/todo";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import ChecklistIcon from "@mui/icons-material/Checklist";

interface TodosListProps {
  todos: Todo[];
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onClick?: (todo: Todo) => void;
  loading?: boolean;
  onCreateNew?: () => void;
}

export const TodosList: React.FC<TodosListProps> = ({
  todos,
  onEdit,
  onDelete,
  onClick,
  loading = false,
  onCreateNew,
}) => {
  if (loading) {
    return <LoadingSpinner message="Loading todos..." />;
  }

  if (todos.length === 0) {
    return (
      <EmptyState
        title="No todo lists yet"
        description="Create your first todo list to get started!"
        actionLabel="Create Todo List"
        onAction={onCreateNew}
        icon={<ChecklistIcon />}
      />
    );
  }

  return (
    <Grid container spacing={3}>
      {todos.map((todo) => (
        <Grid item xs={12} sm={6} md={4} key={todo.id}>
          <TodoCard
            todo={todo}
            onEdit={onEdit}
            onDelete={onDelete}
            onClick={onClick}
          />
        </Grid>
      ))}
    </Grid>
  );
};
