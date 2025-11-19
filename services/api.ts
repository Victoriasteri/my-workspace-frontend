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
 * Global axios instance.
 * Initialized once when config is loaded from /api/config endpoint.
 */
let apiClient: AxiosInstance | null = null;

/**
 * Initialize the global axios instance with the API base URL.
 * This should be called once when the app loads, after fetching config from /api/config.
 *
 * @param baseURL - The API base URL from the config endpoint
 */
export const initializeApiClient = (baseURL: string): void => {
  if (apiClient) {
    // Update existing client's base URL
    apiClient.defaults.baseURL = baseURL;
    return;
  }

  // Create new axios instance
  apiClient = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // Response interceptor for authentication errors
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
      }
      return Promise.reject(error);
    }
  );
};

/**
 * Get the global API client instance.
 *
 * @throws Error if the client hasn't been initialized yet
 */
const getApiClient = (): AxiosInstance => {
  if (!apiClient) {
    throw new Error(
      "API client not initialized. Make sure ConfigProvider is mounted and config is loaded."
    );
  }
  return apiClient;
};

/**
 * Authentication API
 */
export const authApi = {
  register: async (userData: CreateUserDto): Promise<AuthResponse> => {
    const response = await getApiClient().post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    return response.data;
  },

  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const response = await getApiClient().post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await getApiClient().post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },

  getMe: async (): Promise<User> => {
    const response = await getApiClient().get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },
};

/**
 * Notes API
 */
export const notesApi = {
  getAllNotes: async (): Promise<Note[]> => {
    const response = await getApiClient().get<Note[]>(API_ENDPOINTS.NOTES.BASE);
    return response.data;
  },

  getNoteById: async (id: string): Promise<Note> => {
    const response = await getApiClient().get<Note>(
      API_ENDPOINTS.NOTES.BY_ID(id)
    );
    return response.data;
  },

  createNote: async (note: CreateNoteDto): Promise<Note> => {
    const response = await getApiClient().post<Note>(
      API_ENDPOINTS.NOTES.BASE,
      note
    );
    return response.data;
  },

  updateNote: async (id: string, note: UpdateNoteDto): Promise<Note> => {
    const response = await getApiClient().put<Note>(
      API_ENDPOINTS.NOTES.BY_ID(id),
      note
    );
    return response.data;
  },

  patchNote: async (id: string, note: UpdateNoteDto): Promise<Note> => {
    const response = await getApiClient().patch<Note>(
      API_ENDPOINTS.NOTES.BY_ID(id),
      note
    );
    return response.data;
  },

  deleteNote: async (id: string): Promise<void> => {
    await getApiClient().delete(API_ENDPOINTS.NOTES.BY_ID(id));
  },

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

  getNoteAttachments: async (noteId: string): Promise<Attachment[]> => {
    const response = await getApiClient().get<Attachment[]>(
      API_ENDPOINTS.NOTES.ATTACHMENTS(noteId)
    );
    return response.data;
  },

  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await getApiClient().delete(
      API_ENDPOINTS.NOTES.ATTACHMENT_BY_ID(attachmentId)
    );
  },
};

/**
 * Todos API
 */
export const todosApi = {
  getAllTodos: async (): Promise<Todo[]> => {
    const response = await getApiClient().get<Todo[]>(API_ENDPOINTS.TODOS.BASE);
    return response.data;
  },

  getTodoById: async (id: string): Promise<Todo> => {
    const response = await getApiClient().get<Todo>(
      API_ENDPOINTS.TODOS.BY_ID(id)
    );
    return response.data;
  },

  createTodo: async (todo: CreateTodoDto): Promise<Todo> => {
    const response = await getApiClient().post<Todo>(
      API_ENDPOINTS.TODOS.BASE,
      todo
    );
    return response.data;
  },

  updateTodo: async (id: string, todo: UpdateTodoDto): Promise<Todo> => {
    const response = await getApiClient().put<Todo>(
      API_ENDPOINTS.TODOS.BY_ID(id),
      todo
    );
    return response.data;
  },

  deleteTodo: async (id: string): Promise<void> => {
    await getApiClient().delete(API_ENDPOINTS.TODOS.BY_ID(id));
  },

  getTodoItems: async (todoId: string): Promise<TodoItem[]> => {
    const response = await getApiClient().get<TodoItem[]>(
      API_ENDPOINTS.TODOS.ITEMS(todoId)
    );
    return response.data;
  },

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

  deleteTodoItem: async (todoId: string, itemId: string): Promise<void> => {
    await getApiClient().delete(API_ENDPOINTS.TODOS.ITEM_BY_ID(todoId, itemId));
  },
};
