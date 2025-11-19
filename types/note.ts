export interface Attachment {
  id: string;
  noteId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface Note {
  id?: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string | null;
  attachmentIds: string[];
  attachments?: Attachment[]; // Populated separately when needed
}

export interface CreateNoteDto {
  title: string;
  content: string;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
}
