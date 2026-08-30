# ReviewFlow AI

AI-powered Google Review Management Platform for Retail Clothing Stores.

Helps retail clothing stores collect 5-star Google reviews effortlessly. Customers leave a review in under 15 seconds — just scan, tap, and post.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Storage)
- **AI**: OpenAI GPT-4o-mini for review generation
- **Email**: Resend for notifications
- **Validation**: Zod
- **State**: TanStack Query

---

## Getting Started

### Prerequisites

- Node.js 20.9+
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key
- A [Resend](https://resend.com) API key

### 1. Clone & Install

```bash
cd reviewflow-ai
npm install
```

### 2. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-your_openai_key
RESEND_API_KEY=re_your_resend_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Run the migration and seed SQL files against your Supabase project:

1. Go to the **SQL Editor** in your Supabase dashboard
2. Run `supabase/migrations/001_initial_schema.sql` — creates all tables, RLS policies, and functions
3. Run `supabase/seed.sql` — inserts review tags (positive and negative)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

---

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Login & Signup pages
│   ├── (admin)/              # Admin dashboard (protected)
│   │   ├── dashboard/        # Stats & recent activity
│   │   ├── reviews/          # Review list & detail
│   │   ├── settings/         # Business configuration
│   │   └── qr-code/          # QR code generation
│   ├── r/[slug]/             # Customer review flow (public)
│   ├── api/                  # API routes
│   │   ├── generate-review/  # AI review generation
│   │   ├── reviews/          # Reviews CRUD
│   │   └── notes/            # Admin notes
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── customer/             # Customer flow components
│   ├── admin/                # Admin components
│   └── providers.tsx         # Query + Toast providers
├── lib/
│   ├── supabase/             # Supabase client (browser + server + middleware)
│   ├── ai/                   # OpenAI integration
│   ├── notifications/        # Resend email
│   ├── validators/           # Zod schemas
│   └── utils.ts              # Utility functions
├── types/                    # TypeScript types
└── middleware.ts              # Auth middleware
```

---

## Customer Flow

1. **Scan QR** → Opens `/r/{storeSlug}`
2. **Rate** → Tap 1–5 stars
3. **If 5★** → Select positive tags → AI generates review → Copy & open Google
4. **If < threshold** → Select complaint tags → Optional feedback → Submit privately

---

## Admin Dashboard

- **Dashboard**: Stats cards (total, 5-star, private, pending, avg rating) + recent activity
- **Reviews**: Filterable list with status badges → click for detail view
- **Review Detail**: Rating, text, feedback, tags, timeline, actions (approve/reject/resolve), notes
- **Settings**: Business name, logo, Google URL, threshold, notifications, branding
- **QR Code**: Generate, preview, download PNG/SVG, print A4 poster

---

## Deployment

### Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables
4. Deploy

### Supabase

1. Run migrations on your production Supabase project
2. Run seed SQL for initial tags
3. Configure auth email templates (optional)

---

## Database Schema

| Table | Description |
|---|---|
| `profiles` | Admin user profiles (linked to Supabase Auth) |
| `businesses` | Store configuration |
| `reviews` | All customer submissions |
| `review_tags` | Predefined tags (positive/negative) |
| `review_tag_mapping` | M2M join: reviews ↔ tags |
| `admin_notes` | Internal notes on reviews |

All tables have Row Level Security enabled.

---

## License

Private - All rights reserved.
