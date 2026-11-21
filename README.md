# Eltayar Group website

Static one-page website for GitHub Pages.

## Deployment
1. Keep the complete folder structure.
2. Publish the repository from `main` / root in GitHub Pages.
3. The public Supabase configuration is in `assets/js/config.js`.
4. The project request form calls the existing Supabase Edge Function:
   `https://izxdoyqypugjbskfuqjc.supabase.co/functions/v1/submit-project`
5. The Edge Function must retain its server-side `SUPABASE_SERVICE_ROLE_KEY` secret. Never add that secret to this repository or any browser file.

## Supabase integration
- Project URL: `https://izxdoyqypugjbskfuqjc.supabase.co`
- Edge Function: `submit-project`
- Table: `public.project_requests`
- The form sends `name`, `email`, `phone`, `preferred_contact`, `package_name`,
  `details`, `launch_discount`, `consent`, and the honeypot `website` field.
- A successful reference number is shown only after the Edge Function confirms the database insert.
- The `privacy.html` page is linked from the consent text.

## Security notes
The publishable key in `assets/js/config.js` is designed for browser use. Database access to project requests must continue to be mediated by the Edge Function and the existing Row Level Security policies. Do not expose the service-role key, database password, or other secret values in the static site.

## Local preview
Open `index.html` in a browser. A local `file://` preview may be blocked by browser networking/CORS; test the live Supabase submission from the deployed GitHub Pages origin.
