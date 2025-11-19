import axios, { AxiosInstance } from "axios";
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
import { API_ENDPOINTS } from "@/config/api-endpoints";

/**
 * Creates an axios client instance with the provided base URL.
 *
 * Uses HTTP-only cookies for authentication (withCredentials: true).
 * Cookies are automatically sent with requests and managed by the backend.
 */
const createApiClient = (baseURL: string): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, // Send cookies with requests (required for HTTP-only cookies)
  });

  // Add response interceptor to handle authentication errors
  client.interceptors.response.use(
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

  return client;
};

/**
 * Gets the API client instance with the current base URL.
 *
 * This function fetches the base URL from the config endpoint if available,
 * otherwise falls back to a default for development.
 */
let apiClient: AxiosInstance | null = null;
let apiBaseUrl: string | null = null;

/**
 * Initialize the API client with the provided base URL.
 * This should be called once when the config is loaded.
 */
export const initializeApiClient = (baseURL: string): void => {
  if (apiBaseUrl !== baseURL) {
    apiBaseUrl = baseURL;
    apiClient = createApiClient(baseURL);
  }
};

/**
 * Gets the API client instance. Throws an error if not initialized.
 */
const getApiClient = (): AxiosInstance => {
  if (!apiClient) {
    // Fallback for development or if config hasn't loaded yet
    const fallbackUrl =
      typeof window !== "undefined"
        ? "http://localhost:3000"
        : "http://localhost:3000";
    apiClient = createApiClient(fallbackUrl);
  }
  return apiClient;
};

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
    const response = await getApiClient().post<AuthResponse>(
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
    const response = await getApiClient().post<AuthResponse>(
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
      await getApiClient().post(API_ENDPOINTS.AUTH.LOGOUT);
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
    const response = await getApiClient().get<User>(API_ENDPOINTS.AUTH.ME);
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
    const response = await getApiClient().get<Note[]>(API_ENDPOINTS.NOTES.BASE);
    return response.data;
  },

  /**
   * Get a single note by ID
   * GET /notes/:id
   */
  getNoteById: async (id: string): Promise<Note> => {
    const response = await getApiClient().get<Note>(
      API_ENDPOINTS.NOTES.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Create a new note
   * POST /notes
   */
  createNote: async (note: CreateNoteDto): Promise<Note> => {
    const response = await getApiClient().post<Note>(
      API_ENDPOINTS.NOTES.BASE,
      note
    );
    return response.data;
  },

  /**
   * Update a note (full update)
   * PUT /notes/:id
   */
  updateNote: async (id: string, note: UpdateNoteDto): Promise<Note> => {
    const response = await getApiClient().put<Note>(
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
    const response = await getApiClient().patch<Note>(
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
    await getApiClient().delete(API_ENDPOINTS.NOTES.BY_ID(id));
  },

  /**
   * Upload an attachment to a note
   * POST /notes/:id/attachments
   */
  uploadAttachment: async (noteId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await getApiClient().post<Attachment>(
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
    const response = await getApiClient().get<Attachment[]>(
      API_ENDPOINTS.NOTES.ATTACHMENTS(noteId)
    );
    return response.data;
  },

  /**
   * Delete an attachment
   * DELETE /notes/attachments/:attachmentId
   */
  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await getApiClient().delete(
      API_ENDPOINTS.NOTES.ATTACHMENT_BY_ID(attachmentId)
    );
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
    const response = await getApiClient().get<Todo[]>(API_ENDPOINTS.TODOS.BASE);
    return response.data;
  },

  /**
   * Get a single todo by ID
   * GET /todos/:id
   */
  getTodoById: async (id: string): Promise<Todo> => {
    const response = await getApiClient().get<Todo>(
      API_ENDPOINTS.TODOS.BY_ID(id)
    );
    return response.data;
  },

  /**
   * Create a new todo list
   * POST /todos
   */
  createTodo: async (todo: CreateTodoDto): Promise<Todo> => {
    const response = await getApiClient().post<Todo>(
      API_ENDPOINTS.TODOS.BASE,
      todo
    );
    return response.data;
  },

  /**
   * Update a todo list
   * PUT /todos/:id
   */
  updateTodo: async (id: string, todo: UpdateTodoDto): Promise<Todo> => {
    const response = await getApiClient().put<Todo>(
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
    await getApiClient().delete(API_ENDPOINTS.TODOS.BY_ID(id));
  },

  /**
   * Get all items for a todo
   * GET /todos/:id/items
   */
  getTodoItems: async (todoId: string): Promise<TodoItem[]> => {
    const response = await getApiClient().get<TodoItem[]>(
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
    const response = await getApiClient().post<TodoItem>(
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
    const response = await getApiClient().put<TodoItem>(
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
    await getApiClient().delete(API_ENDPOINTS.TODOS.ITEM_BY_ID(todoId, itemId));
  },
};
