export interface TodoItem {
  id?: string;
  description: string;
  isCompleted: boolean;
  todoId?: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface Todo {
  id?: string;
  title: string;
  color: string;
  createdAt?: string;
  updatedAt?: string | null;
  items?: TodoItem[]; // Will be populated when API is ready
}

export interface CreateTodoDto {
  title: string;
  color: string;
}

export interface UpdateTodoDto {
  title?: string;
  color?: string;
}

export interface CreateTodoItemDto {
  description: string;
  isCompleted: boolean;
}

export interface UpdateTodoItemDto {
  description?: string;
  isCompleted?: boolean;
}
