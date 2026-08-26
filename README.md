![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/eshinhw/runners-league)
![GitHub issues](https://img.shields.io/github/issues/eshinhw/runners-league)
![GitHub pull requests](https://img.shields.io/github/issues-pr/eshinhw/runners-league)

# Runners League

A running community where runners track their gear, log training runs and World Marathon Majors finishes, compete on community rankings, and share a crowd-voted running playlist.

For a deep technical dive (data model, auth, external integrations, known gotchas), see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

<img width="1426" alt="Portfolio Analyzer Demo Page" src="https://github.com/user-attachments/assets/88ef585d-3b43-4e5a-84bf-1fe5d0207beb">

## Stack

- **Next.js 16** (App Router, Server Components + Server Actions) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Prisma 7** + **PostgreSQL** ([Neon](https://neon.tech)), via the `@prisma/adapter-pg` driver adapter
- **Auth.js (NextAuth v5)** — Google OAuth + passwordless email magic links, database-backed sessions
- **Nodemailer** for transactional email (magic links, admin verification notices)
- **Cloudflare R2** (S3-compatible) for image uploads

## Features

| Route | What it does |
|---|---|
| `/gear` | Top Gears — community-wide gear popularity leaderboard by category |
| `/settings/gear` | Personal Gear Locker — add/retire shoes, watches, apparel, and more |
| `/settings/runs` | My Races — log Majors finishes (major, year, distance, time) and training runs |
| `/rankings` | Majors Completed and By-Race leaderboards, filterable by year and distance |
| `/races` | World Marathon Majors calendar (2026–2027), dates and distances per race |
| `/playlist` | Runners Playlist — crowd-submitted, upvoted running songs (verified against the iTunes catalog) |
| `/community` | Discussions, articles, training plans, and Q&A between runners |
| `/training` | Marathon training plan content |
| `/profile/[username]` | Public runner profile — gear locker, races, tier badges |
| `/admin/verify` | Admin review queue for race results submitted with bib/photo evidence |

A handful of read-only JSON endpoints (`/api/gear`, `/api/activities`, `/api/races`, `/api/playlist`) back some of the above.

## Data Model

Full schema in `prisma/schema.prisma`. Core entities:

- `User` / `Follow` — accounts and follow relationships
- `Gear` / `GearReview` — a runner's gear locker and reviews
- `Activity` — training runs *and* race results (`major`/`raceDistance` set only for World Marathon Majors finishes; `verifiedAt` tracks admin review)
- `ActivityGear` — which gear was used on a given run
- `Track` / `Like` — Runners Playlist songs and upvotes
- `Post` / `Comment` — community content and discussion

The World Marathon Majors themselves (Tokyo, Boston, London, Berlin, Chicago, New York, Sydney, Cape Town) and their distance programs (5K/10K/Half/Full) are static app config in `src/lib/majors.ts`, not a database table.

## Getting Started

```bash
cp .env.example .env        # fill in DATABASE_URL at minimum
npm install                  # runs `prisma generate` automatically
npx prisma migrate dev       # apply migrations
npx tsx --env-file=.env prisma/mockData/seed.ts   # optional: seed sample data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Full env var reference is in `.env.example`; auth (`AUTH_SECRET`, `EMAIL_SERVER`/`EMAIL_FROM` or `AUTH_GOOGLE_ID`/`SECRET`) is required to sign in locally. Image upload (`R2_*`) is optional for local dev.

## Mock Data

`prisma/mockData/` holds additive, production-safe scripts for bootstrapping demo content (users, gear, race history, playlist tracks) — every row is tagged `isMockData: true` so it can be bulk-removed later with `prisma/mockData/remove.ts`. `prisma/seed.ts` is a separate, **destructive** local-dev-only reset script. See `docs/ARCHITECTURE.md` for details.
