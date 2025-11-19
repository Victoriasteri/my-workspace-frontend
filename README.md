# Notes Frontend

A Next.js application for managing notes, built with Material-UI and TypeScript.

## Features

- ✅ Create new notes
- ✅ View all notes
- ✅ Edit existing notes
- ✅ Delete notes
- ✅ Beautiful Material-UI interface
- ✅ Well-organized code structure

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Material-UI (MUI)** - UI components
- **Axios** - HTTP client for API calls

## Project Structure

```
notes-frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with MUI theme
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── NoteCard.tsx       # Individual note card component
│   ├── NoteForm.tsx       # Create/Edit note form dialog
│   └── NotesList.tsx      # Notes grid list component
├── services/              # API service layer
│   └── api.ts            # Axios API client with all HTTP methods
├── types/                 # TypeScript type definitions
│   └── note.ts           # Note-related types
└── theme/                 # MUI theme configuration
    └── theme.ts          # Material-UI theme
```

## API Endpoints

The app uses the following endpoints (backend running on `localhost:3000`):

- `GET /notes` - Get all notes
- `GET /notes/:id` - Get a single note by ID
- `POST /notes` - Create a new note
- `PUT /notes/:id` - Update a note (full update)
- `PATCH /notes/:id` - Update a note (partial update)
- `DELETE /notes/:id` - Delete a note

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note:** Make sure your backend API is running on `localhost:3000` before starting the frontend. If your backend runs on a different port, update the `API_BASE_URL` in `services/api.ts`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Code Organization

The codebase is organized with clear separation of concerns:

- **Services** (`services/api.ts`): All API calls using axios, organized by HTTP method
- **Components**: Reusable UI components with clear responsibilities
- **Types**: TypeScript interfaces for type safety
- **Theme**: MUI theme configuration in a separate file
# my-workspace-frontend
