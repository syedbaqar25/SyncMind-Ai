# SyncMind AI Architecture Guide

## System Shape

SyncMind AI is split into `frontend/` and `backend/`.

- Frontend: React 18, Vite, Tailwind, Framer Motion, GSAP, Three.js, React Query, Zustand, Socket.io client, Recharts, DnD Kit, WaveSurfer.
- Backend: Express, Prisma/PostgreSQL, Redis/BullMQ, Socket.io, Cloudinary, Resend, OpenAI, Pinecone.

## Backend Notes

- `src/app.js` owns Express middleware and route mounting.
- `src/server.js` validates env, connects Prisma, initializes Socket.io, and starts the BullMQ worker.
- `src/socket.js` authenticates socket connections using access JWTs and joins `user:*`, `workspace:*`, and `meeting:*` rooms.
- `src/queues/workers/meeting.worker.js` processes transcription, analysis, vectorization, notifications, email, and status events.
- Prisma schema lives at `backend/src/prisma/schema.prisma`; `backend/package.json` points Prisma there.

## Frontend Notes

- `src/App.jsx` uses lazy page imports, protected routes, `AnimatePresence`, and route-level transitions.
- `src/services/api.js` owns Axios auth headers and refresh handling.
- `src/store/*` contains persisted auth/workspace state and meeting processing state.
- Dashboard pages use `DashboardLayout`; public auth pages use `AuthLayout`.
- Landing page visual work is in `components/landing`, including the Three.js particle hero.

## Security Notes

- Never commit `.env`.
- Required backend env vars are validated at startup.
- API inputs use Zod middleware before controllers.
- JWT auth guards protected routes.
- Passwords use bcrypt with 12 salt rounds.
- Refresh tokens are hashed before database storage and rotated on refresh.
- User-facing text inputs are sanitized before persistence in controllers.

## Known Local Environment Caveats

This machine did not expose Docker/PostgreSQL during build, so live Prisma migrations and end-to-end upload/worker execution need to be run on a machine with Docker or managed Postgres/Redis available.

`react-wavesurfer` was not installed because the published package declares a React 15 peer dependency. The app uses `wavesurfer.js` directly through `AudioWaveform.jsx`.
