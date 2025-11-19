import axios from "axios";
import { Note, CreateNoteDto, UpdateNoteDto, Attachment } from "@/types/note";
import {
  Todo,
  CreateTodoDto,
  UpdateTodoDto,
  TodoItem,
  CreateTodoItemDto,
  UpdateTodoItemDto,
} from "@/types/todo";
import { User, CreateUserDto, LoginDto, AuthResponse } from "@/types/user";

const API_BASE_URL = "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with requests (required for HTTP-only cookies)
});

// Note: We use HTTP-only cookies for authentication, so no token management is needed.
// Cookies are automatically sent with requests via withCredentials: true

// Add response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear user from sessionStorage
      // ProtectedRoute will handle redirect
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("user");
        // Dispatch a custom event that AuthContext can listen to
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  // POST /auth/register - Register a new user
  register: async (userData: CreateUserDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      userData
    );
    // Cookie is set automatically by the backend (HTTP-only)
    return response.data;
  },

  // POST /auth/login - Login user
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    // Cookie is set automatically by the backend (HTTP-only)
    return response.data;
  },

  // POST /auth/logout - Logout user
  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
      // Cookie is cleared automatically by the backend
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },

  // GET /auth/me - Get current user profile
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },
};

export const notesApi = {
  // GET /notes - Get all notes
  getAllNotes: async (): Promise<Note[]> => {
    const response = await apiClient.get<Note[]>("/notes");
    return response.data;
  },

  // GET /notes/:id - Get a single note by ID
  getNoteById: async (id: string): Promise<Note> => {
    const response = await apiClient.get<Note>(`/notes/${id}`);
    return response.data;
  },

  // POST /notes - Create a new note
  createNote: async (note: CreateNoteDto): Promise<Note> => {
    const response = await apiClient.post<Note>("/notes", note);
    return response.data;
  },

  // PUT /notes/:id - Update a note (full update)
  updateNote: async (id: string, note: UpdateNoteDto): Promise<Note> => {
    const response = await apiClient.put<Note>(`/notes/${id}`, note);
    return response.data;
  },

  // PATCH /notes/:id - Update a note (partial update)
  patchNote: async (id: string, note: UpdateNoteDto): Promise<Note> => {
    const response = await apiClient.patch<Note>(`/notes/${id}`, note);
    return response.data;
  },

  // DELETE /notes/:id - Delete a note
  deleteNote: async (id: string): Promise<void> => {
    await apiClient.delete(`/notes/${id}`);
  },

  // POST /notes/:id/attachments - Upload an attachment to a note
  uploadAttachment: async (noteId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<Attachment>(
      `/notes/${noteId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // GET /notes/:id/attachments - Get all attachments for a note
  getNoteAttachments: async (noteId: string): Promise<Attachment[]> => {
    const response = await apiClient.get<Attachment[]>(
      `/notes/${noteId}/attachments`
    );
    return response.data;
  },

  // DELETE /notes/attachments/:attachmentId - Delete an attachment
  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await apiClient.delete(`/notes/attachments/${attachmentId}`);
  },
};

export const todosApi = {
  // GET /todos - Get all todos
  getAllTodos: async (): Promise<Todo[]> => {
    const response = await apiClient.get<Todo[]>("/todos");
    return response.data;
  },

  // GET /todos/:id - Get a single todo by ID
  getTodoById: async (id: string): Promise<Todo> => {
    const response = await apiClient.get<Todo>(`/todos/${id}`);
    return response.data;
  },

  // POST /todos - Create a new todo list
  createTodo: async (todo: CreateTodoDto): Promise<Todo> => {
    const response = await apiClient.post<Todo>("/todos", todo);
    return response.data;
  },

  // PUT /todos/:id - Update a todo list
  updateTodo: async (id: string, todo: UpdateTodoDto): Promise<Todo> => {
    const response = await apiClient.put<Todo>(`/todos/${id}`, todo);
    return response.data;
  },

  // DELETE /todos/:id - Delete a todo list
  deleteTodo: async (id: string): Promise<void> => {
    await apiClient.delete(`/todos/${id}`);
  },

  // GET /todos/:id/items - Get all items for a todo
  getTodoItems: async (todoId: string): Promise<TodoItem[]> => {
    const response = await apiClient.get<TodoItem[]>(`/todos/${todoId}/items`);
    return response.data;
  },

  // POST /todos/:id/items - Create a new item in a todo
  createTodoItem: async (
    todoId: string,
    item: CreateTodoItemDto
  ): Promise<TodoItem> => {
    const response = await apiClient.post<TodoItem>(
      `/todos/${todoId}/items`,
      item
    );
    return response.data;
  },

  // PUT /todos/:id/items/:itemId - Update a todo item
  updateTodoItem: async (
    todoId: string,
    itemId: string,
    item: UpdateTodoItemDto
  ): Promise<TodoItem> => {
    const response = await apiClient.put<TodoItem>(
      `/todos/${todoId}/items/${itemId}`,
      item
    );
    return response.data;
  },

  // DELETE /todos/:id/items/:itemId - Delete a todo item
  deleteTodoItem: async (todoId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/todos/${todoId}/items/${itemId}`);
  },
};
