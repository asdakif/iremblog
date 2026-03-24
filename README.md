# Irem Blog

A warm, literary story blog built with Next.js 14, SQLite, Prisma, TailwindCSS, and NextAuth.js.

## Features

- **Public Blog** — Homepage with featured stories, category/tag filtering, full-text search, and a comment section on each story
- **Reader Accounts** — Register/login, profile page, and cloud-synced Favorites + Read Later lists
- **Notifications + Series UX** — Optional web push opt-in and improved in-story series progress/next-part flow
- **Admin Panel** — Password-protected dashboard to create/edit/delete stories (with TipTap rich text editor), manage categories & tags, and moderate comments
- **Design** — Warm literary aesthetic with Playfair Display headings, Lora body text, colorful gradients, dark mode support, and responsive layout

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | SQLite via Prisma ORM |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js v4 |
| Editor | TipTap |
| Icons | Lucide React |

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd iremblog
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@yourblog.com"
ADMIN_PASSWORD="your-secure-password"
READER_AUTH_SECRET="reader-session-secret-change-me"
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_SUBJECT="mailto:admin@yourblog.com"
```

Production note: set `ADMIN_PASSWORD` as a bcrypt hash (plaintext fallback is only for local development).

### 3. Initialize the database

```bash
npx prisma migrate dev --name init
```

### 4. Seed with sample stories

```bash
npm run db:seed
```

Or do steps 3 & 4 together:

```bash
npm run setup
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the blog.

## Admin Panel

Go to [http://localhost:3000/admin](http://localhost:3000/admin) and sign in with the credentials from your `.env` file.

Default credentials (change in `.env`):
- Email: `admin@iremblog.com`
- Password: `admin123`

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── stories/[slug]/       # Story detail
│   ├── categories/[slug]/    # Category filter
│   ├── tags/[slug]/          # Tag filter
│   ├── search/               # Full-text search
│   ├── admin/                # Admin panel
│   │   ├── login/
│   │   ├── stories/
│   │   ├── categories/
│   │   ├── tags/
│   │   └── comments/
│   └── api/                  # API routes
├── components/
│   ├── public/               # Header, Footer, StoryCard, etc.
│   └── admin/                # AdminNav, TipTapEditor, forms
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── auth.ts               # NextAuth config
│   └── utils.ts              # Helpers
prisma/
├── schema.prisma             # Database schema
└── seed.ts                   # Sample data
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm run test` | Run unit tests once |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:seed` | Seed sample stories |
| `npm run db:studio` | Open Prisma Studio |
| `npm run setup` | Migrate + seed (first time) |
