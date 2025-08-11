HotBox Super Admin Panel

- Framework: Next.js App Router
- Styling: Tailwind v4
- Charts: Recharts
- Icons: lucide-react
- Data: Supabase (client-side for now)

Environment variables

Create `.env.local` with your Supabase project details:

```
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

Commands

- Install: `npm install`
- Lint: `npm run lint`
- Build: `npm run build`
- Start (prod): `npm start`

Deploy

- Vercel-ready. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Project Settings → Environment Variables.
