/**
 * API Endpoint Constants
 *
 * Centralized endpoint definitions to eliminate magic strings throughout the application.
 * All API endpoints should be defined here and imported where needed.
 */

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },

  // Notes endpoints
  NOTES: {
    BASE: "/notes",
    BY_ID: (id: string) => `/notes/${id}`,
    ATTACHMENTS: (noteId: string) => `/notes/${noteId}/attachments`,
    ATTACHMENT_BY_ID: (attachmentId: string) =>
      `/notes/attachments/${attachmentId}`,
  },

  // Todos endpoints
  TODOS: {
    BASE: "/todos",
    BY_ID: (id: string) => `/todos/${id}`,
    ITEMS: (todoId: string) => `/todos/${todoId}/items`,
    ITEM_BY_ID: (todoId: string, itemId: string) =>
      `/todos/${todoId}/items/${itemId}`,
  },
} as const;
