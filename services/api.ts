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
import { API_BASE_URL } from "@/config/env";
import { API_ENDPOINTS } from "@/config/api-endpoints";

/**
 * Axios client instance configured with base URL and default headers.
 *
 * Uses HTTP-only cookies for authentication (withCredentials: true).
 * Cookies are automatically sent with requests and managed by the backend.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with requests (required for HTTP-only cookies)
});

/**
 * Response interceptor to handle authentication errors.
 *
 * When a 401 (Unauthorized) response is received, dispatches a custom event
 * that AuthContext listens to for automatic logout handling.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - notify AuthContext to clear user
      // ProtectedRoute will handle redirect
      if (typeof window !== "undefined") {
        // Dispatch a custom event that AuthContext can listen to
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API
 *
 * Handles user registration, login, logout, and profile retrieval.
 * Uses HTTP-only cookies for secure authentication.
 */
export const authApi = {
  /**
   * Register a new user
   * POST /auth/register
   */
  register: async (userData: CreateUserDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    // Cookie is set automatically by the backend (HTTP-only)
    return response.data;
  },

  /**
   * Login user
   * POST /auth/login
   */
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    // Cookie is set automatically by the backend (HTTP-only)
    return response.data;
  },

  /**
   * Logout user
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      // Cookie is cleared automatically by the backend
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },

  /**
   * Get current user profile
   * GET /auth/me
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },
};

/**
 * Notes API
 *
 * Handles CRUD operations for notes and note attachments.
 */
export const notesApi = {
  /**
   * Get all notes
   * GET /notes
   */
  getAllNotes: async (): Promise<Note[]> => {
    const response = await apiClient.get<Note[]>(API_ENDPOINTS.NOTES.BASE);
    return response.data;
  },

  /**
   * Get a single note by ID
   * GET /notes/:id
   */
  getNoteById: async (id: string): Promise<Note> => {
    const response = await apiClient.get<Note>(API_ENDPOINTS.NOTES.BY_ID(id));
    return response.data;
  },

  /**
   * Create a new note
   * POST /notes
   */
  createNote: async (note: CreateNoteDto): Promise<Note> => {
    const response = await apiClient.post<Note>(API_ENDPOINTS.NOTES.BASE, note);
    return response.data;
  },

  /**
   * Update a note (full update)
   * PUT /notes/:id
   */
  updateNote: async (id: string, note: UpdateNoteDto): Promise<Note> => {
    const response = await apiClient.put<Note>(
      API_ENDPOINTS.NOTES.BY_ID(id),
      note
    );
    return response.data;
  },

  /**
   * Update a note (partial update)
   * PATCH /notes/:id
   */
  patchNote: async (id: string, note: UpdateNoteDto): Promise<Note> => {
    const response = await apiClient.patch<Note>(
      API_ENDPOINTS.NOTES.BY_ID(id),
      note
    );
    return response.data;
  },

  /**
   * Delete a note
   * DELETE /notes/:id
   */
  deleteNote: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.NOTES.BY_ID(id));
  },

  /**
   * Upload an attachment to a note
   * POST /notes/:id/attachments
   */
  uploadAttachment: async (noteId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<Attachment>(
      API_ENDPOINTS.NOTES.ATTACHMENTS(noteId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Get all attachments for a note
   * GET /notes/:id/attachments
   */
  getNoteAttachments: async (noteId: string): Promise<Attachment[]> => {
    const response = await apiClient.get<Attachment[]>(
      API_ENDPOINTS.NOTES.ATTACHMENTS(noteId)
    );
    return response.data;
  },

  /**
   * Delete an attachment
   * DELETE /notes/attachments/:attachmentId
   */
  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.NOTES.ATTACHMENT_BY_ID(attachmentId));
  },
};

/**
 * Todos API
 *
 * Handles CRUD operations for todo lists and todo items.
 */
export const todosApi = {
  /**
   * Get all todos
   * GET /todos
   */
  getAllTodos: async (): Promise<Todo[]> => {
    const response = await apiClient.get<Todo[]>(API_ENDPOINTS.TODOS.BASE);
    return response.data;
  },

  /**
   * Get a single todo by ID
   * GET /todos/:id
   */
  getTodoById: async (id: string): Promise<Todo> => {
    const response = await apiClient.get<Todo>(API_ENDPOINTS.TODOS.BY_ID(id));
    return response.data;
  },

  /**
   * Create a new todo list
   * POST /todos
   */
  createTodo: async (todo: CreateTodoDto): Promise<Todo> => {
    const response = await apiClient.post<Todo>(API_ENDPOINTS.TODOS.BASE, todo);
    return response.data;
  },

  /**
   * Update a todo list
   * PUT /todos/:id
   */
  updateTodo: async (id: string, todo: UpdateTodoDto): Promise<Todo> => {
    const response = await apiClient.put<Todo>(
      API_ENDPOINTS.TODOS.BY_ID(id),
      todo
    );
    return response.data;
  },

  /**
   * Delete a todo list
   * DELETE /todos/:id
   */
  deleteTodo: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.TODOS.BY_ID(id));
  },

  /**
   * Get all items for a todo
   * GET /todos/:id/items
   */
  getTodoItems: async (todoId: string): Promise<TodoItem[]> => {
    const response = await apiClient.get<TodoItem[]>(
      API_ENDPOINTS.TODOS.ITEMS(todoId)
    );
    return response.data;
  },

  /**
   * Create a new item in a todo
   * POST /todos/:id/items
   */
  createTodoItem: async (
    todoId: string,
    item: CreateTodoItemDto
  ): Promise<TodoItem> => {
    const response = await apiClient.post<TodoItem>(
      API_ENDPOINTS.TODOS.ITEMS(todoId),
      item
    );
    return response.data;
  },

  /**
   * Update a todo item
   * PUT /todos/:id/items/:itemId
   */
  updateTodoItem: async (
    todoId: string,
    itemId: string,
    item: UpdateTodoItemDto
  ): Promise<TodoItem> => {
    const response = await apiClient.put<TodoItem>(
      API_ENDPOINTS.TODOS.ITEM_BY_ID(todoId, itemId),
      item
    );
    return response.data;
  },

  /**
   * Delete a todo item
   * DELETE /todos/:id/items/:itemId
   */
  deleteTodoItem: async (todoId: string, itemId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.TODOS.ITEM_BY_ID(todoId, itemId));
  },
};
