# TaskFlow - Task Management Dashboard

A modern, responsive task management dashboard built with React, TypeScript, and the latest web technologies. TaskFlow demonstrates proficiency with modern React patterns, state management, data fetching, and UI development.

## Features

- **Task List View**: Display all tasks in a responsive grid/table with task details
- **Filtering**: Filter tasks by user and status (All/Completed/Pending) with persistent filter state
- **Inline Status Toggle**: Mark tasks as complete/incomplete with optimistic updates
- **Create Task**: Add new tasks with form validation
- **Edit Task**: Update existing tasks with optimistic updates
- **Delete Task**: Remove tasks with confirmation dialog and optimistic updates
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Skeleton components and loading indicators throughout
- **Responsive Design**: Mobile-first design that works on all screen sizes

## Tech Stack

- **React 19** with **TypeScript**
- **Next.js 15** - React framework
- **TanStack Query (React Query)** - Data fetching and caching
- **Zustand** - Global state management for filters
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Vitest** - Testing framework
- **React Testing Library** - Component testing

## Prerequisites

- Node.js 18+ 
- npm 11+

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd taskflow
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will start and connect to the JSONPlaceholder API for task data.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run preview` - Build and start production server
- `npm run typecheck` - Run TypeScript type checking
- `npm run check` - Run linting and type checking
- `npm run format` - Format code with Biome
- `npm run format:check` - Check code formatting with Biome
- `npm run lint` - Run linting with Biome
- `npm run lint:fix` - Fix linting errors with Biome
- `npm run biome:check` - Run Biome check (format + lint)
- `npm run biome:check:fix` - Run Biome check and fix issues
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI

## API

This application uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/) as the REST API:

- `GET /todos` - Fetch all todos (200 items)
- `GET /todos/:id` - Fetch single todo
- `POST /todos` - Create todo
- `PUT /todos/:id` - Update todo
- `DELETE /todos/:id` - Delete todo
- `GET /users` - Fetch all users

**Note**: JSONPlaceholder simulates CRUD operations. It accepts requests and returns appropriate responses but does not persist data. The application behaves as if persistence works correctly.

## Project Structure

```
src/
├── app/             # Next.js app router pages
├── components/      # React components
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and API client
├── store/           # Zustand stores
├── types/           # TypeScript type definitions
└── test/            # Test setup files
```

## Key Features Implementation

### State Management

- **Zustand** is used for global filter state (user and status filters)
- **TanStack Query** handles all server state (tasks, users) with caching and optimistic updates
- Components use optimized selectors to prevent unnecessary re-renders

### Optimistic Updates

All mutations (create, update, delete, status toggle) implement optimistic updates:
- UI updates immediately before API confirmation
- Automatic rollback on API failure
- User-friendly error messages on failure

### Form Validation

- React Hook Form with Zod schema validation
- Validation on blur and submit
- Clear error messages per field
- Submit button disabled during invalid states

### Performance Optimizations

- React.memo for task components to prevent unnecessary re-renders
- Zustand selectors to minimize re-renders
- TanStack Query caching and stale-while-revalidate strategy
- Skeleton loading states for better perceived performance

## Testing

Run tests with:
```bash
npm test
```

Run tests with UI:
```bash
npm test:ui
```

Tests cover:
- Component rendering and interactions
- Form validation logic
- State management (Zustand store)
- API client methods
- Optimistic updates and rollback scenarios

## TypeScript

This project uses TypeScript with strict mode enabled:
- No `any` types
- Proper interface/type definitions for all data structures
- Type-safe API responses
- Full type coverage

## Code Quality

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** strict mode for type safety
- Clean code principles: reusable, readable, functional approach

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of a front-end developer exercise.
