# Eltayar Group — customer request system

This package preserves the existing single-page design and adds a Supabase-backed request workflow plus a private admin screen. GitHub Pages hosts the static site; Supabase hosts the database and server-side Edge Function.

## What's included
- `index.html`: existing page/design with request submission, optional phone/contact preference, consent, loading/error/success states, and email fallback.
- `admin.html`: email/password sign-in, request list, and status updates.
- `privacy.html`: starter privacy notice; review and adapt it before launch.
- `assets/js/config.js`: public browser config placeholders only.
- `supabase/migrations/202610140001_initial_schema.sql`: database schema and RLS policies.
- `supabase/functions/submit-project/index.ts`: validated request endpoint and optional email notification.

## Deployment checklist

1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/migrations/202610140001_initial_schema.sql`.
3. Create an admin user in Supabase Dashboard → Authentication → Users. Copy that user's UUID.
4. In SQL Editor, authorize that account (replace the UUID):
   ```sql
   insert into public.admin_users (user_id) values ('PASTE-AUTH-USER-UUID-HERE');
   ```
5. Install the Supabase CLI locally and link this project. Deploy the function from the `supabase` folder:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy submit-project --no-verify-jwt
   ```
6. Configure function secrets (replace all example values):
   ```bash
   supabase secrets set SITE_ORIGIN=https://neroqi111111.github.io
   supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
   ```
   Supabase normally provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to deployed Edge Functions; if already present, do not overwrite them. Never put the service-role/secret key in `assets/js/config.js` or any public GitHub file. If using a custom domain, set `SITE_ORIGIN` to that exact origin.
7. Edit `assets/js/config.js` and set `supabaseUrl` and `supabaseAnonKey` to the project URL and the publishable/anon browser key. These are public values; RLS is what protects data. Leave `submitFunctionUrl` empty to use the default endpoint.
8. Optional email notifications: configure `RESEND_API_KEY`, `NOTIFY_EMAIL`, and a verified `NOTIFY_FROM` sender in Supabase function secrets. Email delivery is optional; request storage is the source of truth.
9. Upload the contents of this folder to the repository's Pages publishing branch/root. Ensure `index.html` is in the published root and the paths remain case-sensitive.
10. Open `/admin.html`, sign in with the authorized admin user, and verify it can list/update requests.

## Security notes
- Public visitors can only submit through the Edge Function; the database has no anonymous select/update/delete policy.
- Admin requests are protected by Supabase Auth plus RLS and the `admin_users` allowlist.
- The function includes field validation and a honeypot. Before a high-traffic public launch, add durable per-IP rate limiting / CAPTCHA and monitoring.
- The browser configuration must contain only the publishable/anon key, never the service-role or secret key.
- Review the privacy notice, data retention, offers/discount terms, and contact details before collecting real customer data.

## Test before launch
- Submit valid and invalid forms; ensure success appears only after the database insert succeeds.
- Confirm a request receives a reference code and appears in the admin dashboard.
- Confirm unauthenticated and non-admin users cannot read or change requests.
- Test status changes, phone-less submissions, mobile layout, and the email fallback.
- Check browser console and Edge Function logs. Do not advertise the online form as live until the Supabase setup steps are complete.
