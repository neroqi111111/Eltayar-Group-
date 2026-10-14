-- Eltayar Group project request system. Apply in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.project_requests (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  customer_name text not null check (char_length(customer_name) between 1 and 100),
  email text not null check (char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 30),
  preferred_contact text not null default 'email' check (preferred_contact in ('email','whatsapp')),
  package_name text not null check (char_length(package_name) <= 100),
  project_details text not null check (char_length(project_details) between 15 and 4000),
  launch_discount boolean not null default false,
  consent boolean not null default false check (consent = true),
  status text not null default 'new' check (status in ('new','reviewing','quoted','in_progress','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists project_requests_created_at_idx on public.project_requests (created_at desc);
create index if not exists project_requests_status_idx on public.project_requests (status);
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.project_requests enable row level security;
alter table public.admin_users enable row level security;
-- Admins can verify their own admin membership. No public insert/select/update/delete policy exists.
drop policy if exists "Admins can read own admin membership" on public.admin_users;
create policy "Admins can read own admin membership" on public.admin_users for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Admins can read project requests" on public.project_requests;
create policy "Admins can read project requests" on public.project_requests for select to authenticated using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
drop policy if exists "Admins can update project requests" on public.project_requests;
create policy "Admins can update project requests" on public.project_requests for update to authenticated using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))) with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
-- The Edge Function uses the server-only service role key to insert requests. Never expose that key in the website.
