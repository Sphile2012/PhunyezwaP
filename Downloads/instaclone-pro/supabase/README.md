Supabase setup for Instaclone

1) Create a Supabase project
   - Visit https://app.supabase.com and create a new project.

2) Run schema
   - Open the SQL Editor in Supabase and run `supabase/schema.sql` from this repo to create tables.

3) Service keys
   - In Project Settings → API, copy the `URL` and the `Service Role Key` (keep this secret).

4) Netlify env vars
   - In your Netlify site settings, add the following environment variables:
     - `SUPABASE_URL` = your Supabase project URL
     - `SUPABASE_SERVICE_ROLE_KEY` = your service role key (used by server functions)
     - `GEMINI_API_KEY` = (optional) API key for caption generation

5) Notes
   - Netlify Functions will use Supabase when `SUPABASE_URL` + key exist; otherwise functions fall back to the local `server/data/*.json` files (useful for local testing).
   - Supabase tables must include `id` primary keys for the function upserts to work.

6) Test endpoints
   - After deploying to Netlify, test these endpoints:
     - `GET /.netlify/functions/api` (will respond 404 unless an explicit route provided) — use full paths like `/api/posts` via the deployed site URL, e.g. `https://<your-site>.netlify.app/api/posts`.

7) Troubleshooting
   - If writes fail, ensure the service role key is set and the Supabase table names match exactly (`posts`, `users`, `stories`, `notifications`, `follows`, `saved_posts`).
   - For production persistence, prefer Supabase over the JSON fallback.
