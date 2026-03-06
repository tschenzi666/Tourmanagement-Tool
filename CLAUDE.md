# Tourmanagement Tool

Next.js 15 app with NextAuth (credentials), Prisma ORM, PostgreSQL, Tailwind CSS.

## Setup

- PostgreSQL 16 on localhost:5432
- DB credentials in `.env`
- Git remote uses HTTPS with PAT for pushing

## Workflow

1. Code changes happen in this sandbox environment
2. Commit & push to GitHub (`git push -u origin main`)
3. User pulls on their server and rebuilds

## Common Commands

```bash
pg_ctlcluster 16 main start    # Start PostgreSQL
npx prisma generate             # Regenerate Prisma client
npx prisma db push              # Push schema changes to DB
npx prisma migrate dev          # Create migration
npm run dev                     # Start dev server
npm run build                   # Production build
```

## Key Files

- `src/lib/auth.ts` — NextAuth config with credentials provider
- `src/lib/prisma.ts` — Prisma client singleton
- `src/middleware.ts` — Auth middleware (public routes defined here)
- `prisma/schema.prisma` — Database schema
- `prisma/seed.ts` — Seed data

## Notes

- Always start PostgreSQL before DB operations (it's often stopped in the sandbox)
- Auth pages (login, register, forgot-password, reset-password) are public in middleware
- API routes under `/api/auth` are public in middleware
- Passwords are hashed with bcrypt (12 rounds)
- User email: vincentpadrutt@googlemail.com
