export interface TodoItem {
  id?: string;
  text: string;
  completed: boolean;
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
  text: string;
}

export interface UpdateTodoItemDto {
  text?: string;
  completed?: boolean;
}
