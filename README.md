# Not Yet, Dude 🅿️

**Park your ideas. Revisit in 90 days. Decide then.**

Got an idea? Don't build it yet. Park it. Let it simmer. We'll check in with you in 90 days. If it still excites you then, maybe it's worth building.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase (Postgres + REST API)
- **Fonts:** Fraunces (display) + Outfit (body)
- **Hosting:** Netlify (recommended)

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/1973Studio/notyetdude.git
cd notyetdude
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key from **Settings → API**

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Deploy to Netlify

1. Push to GitHub
2. Connect repo in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in Netlify dashboard

## How It Works

1. **Park it** — Drop your idea with your email
2. **Forget it** — Go do something else
3. **Revisit** — 90 days later, decide: build it 🚀, snooze it 😴, or kill it 💀

## Project Structure

```
notyetdude/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Footer.tsx
│   │   ├── IdeaCard.tsx
│   │   ├── IdeaForm.tsx
│   │   └── Layout.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── types.ts
│   ├── pages/
│   │   ├── Action.tsx
│   │   ├── Dashboard.tsx
│   │   └── Home.tsx
│   ├── styles/
│   │   └── index.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── supabase/
│   └── schema.sql
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Future (v1.1 — not yet, dude)

- Email reminders via Resend/Twilio
- Custom reminder periods (30/60/90/180 days)
- Tags & categories
- Notes field for adding thoughts over time
- "Idea of the day" random resurface

---

Free to use. [☕ Buy me a coffee](https://buymeacoffee.com/notyetdude) if you dig it.

Made with patience by [The Viking](https://theviking.io/)
