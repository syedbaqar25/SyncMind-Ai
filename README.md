# SyncMind AI

Your Meetings. Understood. Automated.

SyncMind AI is a full-stack AI meeting intelligence platform for uploading meeting recordings, generating transcripts and summaries, extracting action items, tracking tasks, and exploring workspace analytics.

## Architecture

```text
React/Vite frontend
  -> Express REST API
  -> PostgreSQL via Prisma
  -> Redis + BullMQ worker
  -> OpenAI Whisper/GPT/Embeddings
  -> Pinecone semantic search
  -> Cloudinary media storage
  -> Resend transactional email
  -> Socket.io realtime events
```

## Local Setup

1. Install Node.js 20, Docker, and npm.
2. Copy environment examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Fill in secrets in `.env` files. Do not commit `.env`.
4. Start services:

```bash
docker compose up -d
```

5. Install dependencies and prepare Prisma:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

6. Start backend:

```bash
npm run dev
```

7. Start frontend:

```bash
cd ../frontend
npm install
npm run dev
```

## API Overview

- `GET /api/health`
- `/api/auth`: register, login, logout, refresh, email verification, password reset, Google OAuth, current user
- `/api/workspaces`: workspace CRUD, members, invites, roles
- `/api/users`: profile, password, notifications
- `/api/meetings`: upload, search, transcript, summary, action items, meeting Q&A
- `/api/tasks`: workspace tasks, my tasks, overdue tasks
- `/api/analytics`: overview, time series, completion, speakers, sentiment, duration buckets

All successful API responses use:

```json
{ "success": true, "data": {}, "message": "OK" }
```

Paginated responses also include `pagination`.

## Realtime Events

Socket.io authenticates with the JWT access token and uses:

- `user:{userId}`
- `workspace:{workspaceId}`
- `meeting:{meetingId}`

Main events include `meeting:processing`, `meeting:transcribed`, `meeting:completed`, `meeting:failed`, `task:updated`, `notification:new`, and `member:joined`.

## Tests

```bash
cd backend
npm test
```

Current suite: 46 passing tests with focused coverage above the configured 70% threshold.

## Deployment

- Frontend: Cloudflare Pages via `.github/workflows/frontend-deploy.yml`
- Backend: Railway with PostgreSQL and Redis
- CI: `.github/workflows/backend-test.yml`

Required deployment secrets are documented in `backend/.env.example` and `frontend/.env.example`.
