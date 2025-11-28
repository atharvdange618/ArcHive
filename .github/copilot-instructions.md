# ArcHive - AI Coding Agent Instructions

## Project Overview

ArcHive is a personal knowledge management system ("second brain") for capturing text notes, web links, and code snippets. The architecture consists of:

- **Backend**: Hono API running on Bun with MongoDB + BullMQ workers for async processing
- **Mobile**: Expo/React Native app with file-based routing (expo-router) and TanStack Query
- **Web**: Placeholder for future implementation

## Architecture Principles

### Backend (Bun + Hono)

- **Runtime**: Use Bun-specific features (`Bun.serve`, `bun run --hot`). Tests run with Vitest in Node environment.
- **Framework**: Hono with middleware pipeline: CORS → rate limiting → auth → body limits → routes
- **Database**: Mongoose ODM with strict schemas. Content has a text search index on `title`, `description`, `content`, `url`.
- **Validation**: Zod schemas in `validation/` for all inputs. Backend config uses `envSchema` to validate environment on startup.
- **Auth Flow**: JWT access tokens (short-lived) + refresh tokens (database-backed). Token blacklisting on logout via `BlacklistedToken` model.
- **Error Handling**: Custom `AppError` hierarchy (`ValidationError`, `NotFoundError`, `UnauthorizedError`) with centralized `app.onError()` handler.

### Async Processing (BullMQ)

Background jobs run in separate worker processes (not integrated with main server):

- `screenshot.worker.ts`: Puppeteer-based screenshot generation for links
- `tag.worker.ts`: NLP-based auto-tagging using `natural`, `franc`, `stopwords-iso`, and Mozilla Readability
- Workers are started independently: `bun start:worker` and `bun start:tag-worker`
- Job queues: `screenshotQueue` and `tagQueue` in `config/bullmq.ts` (Redis connection)
- **Note**: Queue job enqueueing is currently commented out in `content.service.ts` (see lines 33-58)

### Content Processing Pipeline

When a link is created:

1. URL parsing via platform-specific parsers (`parsers/github.parser.ts`, `youtube.parser.ts`, etc.) or generic fallback
2. Tag generation via `generateTagsFromUrl()` using Puppeteer + NLP (extracts readable content, stems keywords, prioritizes hashtags)
3. Metadata enrichment (title, description, preview images)
4. (Future) Screenshot and additional tag refinement via workers

### Mobile (Expo Router + TanStack Query)

- **Navigation**: File-based routing. Auth protected via segment-based guards in `_layout.tsx` checking `isAuthInitialized`.
- **State**: Zustand store (`authStore.ts`) for auth state persisted to SecureStore. TanStack Query for server state.
- **Auth**: Axios interceptors in `axiosInstance.ts` automatically refresh tokens on 401, retry original request.
- **Deep Linking**: `expo-share-intent` handles incoming shares. `useIncomingLinkHandler` processes pending URLs and auto-creates content.
- **Content Types**: Three discriminated types (`text`, `link`, `code`) with type-specific detail screens and cards.
- **API Base**: Hardcoded IP in `constants/index.ts` - **must be updated** for your network.

## Development Workflows

### Backend Setup & Running

```bash
cd backend
bun install
cp .env.example .env  # Configure MONGODB_URI, JWT_SECRET, CORS_ORIGINS
bun run dev           # Hot-reload server on port 3000
bun start:worker      # Start screenshot worker
bun start:tag-worker  # Start tagging worker
bun run test          # Run Vitest tests
```

### Mobile Setup & Running

```bash
cd mobile
npm install
# Update API_BASE_URL in constants/index.ts to your local IP
npm start             # Expo dev server
npm run android       # Run on Android
npm run ios           # Run on iOS (Mac only)
```

### Testing Backend

- Tests in `src/tests/` use Vitest with `vitest.setup.ts` for DB connection/cleanup
- Test structure: `beforeAll` connects to test DB, `beforeEach` clears collections
- Helper function `createAuthenticatedUser()` generates JWT tokens for auth testing
- Tests validate: ownership isolation, discriminated union schemas, pagination, search with stemming

## Code Conventions

### Content Type Discrimination

Content uses Zod discriminated unions based on `type` field:

- `text`: requires `content`, `type`, optional metadata
- `link`: requires `url`, type inferred to `link` if omitted
- `code`: requires `content`, `type`
- **Cannot change type** during update (validation enforced)

### Error Patterns

```typescript
// Service layer throws AppError subclasses
throw new ValidationError("Invalid input", zodError.errors);
throw new NotFoundError("Content not found");

// Route handlers catch and HTTP exceptions propagate to app.onError()
```

### Auth Middleware

Protected routes use:

```typescript
contentRoutes.use(checkBlacklist); // Check token not revoked
contentRoutes.use(authMiddleware); // Verify JWT, set c.get('user')
// Access user: const userId = c.get("user")?._id;
```

### Database Queries

- Always filter by `userId` for content queries to enforce ownership
- Use MongoDB text search: `ContentItem.find({ $text: { $search: query }, userId })`
- Tag search uses stemming via `natural.PorterStemmer.stem(tag)`

### Mobile API Calls

- All API functions in `apis/` use `axiosInstance` (auto-adds auth headers)
- Wrap mutations with TanStack Query's `useMutation`, queries with `useQuery`
- Invalidate queries after mutations: `queryClient.invalidateQueries({ queryKey: ['contents'] })`

## Key Files Reference

- **Auth flow**: `backend/src/services/auth.service.ts`, `mobile/stores/authStore.ts`
- **Content CRUD**: `backend/src/services/content.service.ts`, `backend/src/routes/content.ts`
- **Validation schemas**: `backend/src/validation/content.validation.ts`
- **Models**: `backend/src/db/models/ContentItem.ts`, `User.ts`, `BlacklistedToken.ts`, `RefreshToken.ts`
- **Parsers**: `backend/src/parsers/index.ts` (domain-based router)
- **Workers**: `backend/src/workers/*.worker.ts`
- **Mobile screens**: `mobile/app/(tabs)/`, `mobile/app/details/`, `mobile/app/create/`

## Common Pitfalls

- **CORS issues**: Add origins to `CORS_ORIGINS` in `.env` (comma-separated). Dev mode auto-allows localhost.
- **Mobile API connection**: Update `API_BASE_URL` in `mobile/constants/index.ts` to match your machine's IP
- **Worker jobs not processing**: Ensure Redis is running and workers are started separately
- **Test failures**: Check `MONGODB_URI_TEST` is set and test DB is accessible
- **Token refresh loops**: Ensure axios interceptor doesn't retry on non-401 errors (check `originalRequest._retry`)
- **Validation errors**: Content type switches are blocked - create new item instead of updating type
