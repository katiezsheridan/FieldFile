-- Signups table: leads from the /signup Get Started form and quiz
create table if not exists signups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  property_address text,
  source text default 'signup',
  created_at timestamp with time zone default now()
);

alter table signups enable row level security;

-- Allow anonymous inserts (form is public)
create policy "Anyone can insert signups"
  on signups for insert with check (true);

-- Admin reads
create policy "Admins can view signups"
  on signups for select using (true);
