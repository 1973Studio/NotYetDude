# 🅿️ Not Yet, Dude

Park your ideas. Let them simmer. We'll remind you in 90 days.

**Live site:** [notyetdude.com](https://notyetdude.com)

---

## What is this?

A simple tool for people with too many ideas. Instead of starting every idea immediately (and never finishing), park it for 90 days. If it still excites you then, maybe it's worth building.

## Features

- **Park ideas** with a title and optional description
- **Magic link auth** - no passwords, just email
- **90-day reminders** via email
- **Dashboard** to view all your ideas
- **Snooze, build, or kill** - decide what happens next
- **Free** - forever

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Backend:** Supabase (Auth, Database, Edge Functions)
- **Hosting:** Netlify
- **Email:** Resend
- **Routing:** React Router

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
# Edit .env with your Supabase credentials

# Run dev server
npm run dev
```

---

## Setup Guide

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Authentication > Providers > Email**:
   - Enable Email provider
   - Enable "Confirm email" (for magic links)
4. Go to **Authentication > URL Configuration**:
   - Set Site URL to `https://notyetdude.com`
   - Add `https://notyetdude.com/dashboard` to Redirect URLs
5. Copy your project URL and anon key from **Settings > API**

### 2. Environment Variables

Create a `.env` file:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Netlify Deployment

1. Connect your GitHub repo to Netlify
2. Build settings are auto-configured via `netlify.toml`
3. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Add custom domain: `notyetdude.com`

### 4. Email Reminders (Resend)

1. Create account at [resend.com](https://resend.com)
2. Add your domain and verify DNS
3. Get your API key
4. In Supabase, go to **Edge Functions > Secrets**:
   - Add `RESEND_API_KEY` with your key
   - Add `SITE_URL` = `https://notyetdude.com`

### 5. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy send-reminders
supabase functions deploy handle-action
```

### 6. Set Up Daily Cron Job

In Supabase SQL Editor, run:

```sql
-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily reminders at 9 AM UTC
SELECT cron.schedule(
  'send-daily-reminders',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

---

## Project Structure

```
notyetdude/
├── src/
│   ├── components/
│   │   ├── Footer.tsx
│   │   ├── IdeaCard.tsx
│   │   ├── IdeaForm.tsx
│   │   └── Layout.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   └── Home.tsx
│   ├── styles/
│   │   └── index.css
│   ├── App.tsx
│   ├── main.tsx
│   ├── types.ts
│   └── vite-env.d.ts
├── functions/
│   ├── send-reminders/
│   │   └── index.ts
│   └── handle-action/
│       └── index.ts
├── supabase-schema.sql
├── index.html
├── netlify.toml
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Status Lifecycle

```
[NEW IDEA]
    ↓
  PARKED ←──────────────────┐
    ↓                       │
  (90 days pass)            │
    ↓                       │
  REMINDER EMAIL            │
    ↓                       │
  ┌─────────┬───────────┐   │
  ↓         ↓           ↓   │
BUILD    SNOOZE       KILL  │
  ↓         ↓           ↓   │
Building  Snoozed    Killed │
  ↓         │               │
  └─────────┴───────────────┘
      (can revive/re-park)
```

---

## Buy Me a Coffee

This is free to use. If you find it helpful, you can [buy me a coffee](https://buymeacoffee.com/notyetdude).

---

## License

MIT - do whatever you want with it.

---

Made with patience by [The Viking](https://theviking.io/)
