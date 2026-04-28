# Padayun

Padayun is a bar mentorship web app for essay practice, mentor feedback, and performance tracking.

## Local setup (MongoDB)

1. Ensure local MongoDB is running on `mongodb://127.0.0.1:27017`.
2. Copy `.env.example` to `.env.local` and update values.
3. Install dependencies:

```bash
npm install
```

4. Seed users and sample exam data:

```bash
npm run seed:users
npm run seed:dev
```

5. Start dev server:

```bash
npm run dev
```

Login accounts (default password: `Padayun123!`):
- `admin@padayun.app`
- `mentor@padayun.app`
- `mentee@padayun.app`

## User account creation

- Public self-signup is disabled.
- Only admins can create accounts from `/admin/users`.
- Admins can create `mentor` and `mentee` accounts only.

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript checks
- `npm run seed:users` - seed admin/mentor/mentee users
- `npm run seed:dev` - seed sample question and exam
