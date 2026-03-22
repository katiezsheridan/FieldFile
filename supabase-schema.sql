-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Properties table
create table properties (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  name text not null,
  address text not null,
  county text not null,
  state text not null default 'TX',
  acreage numeric not null,
  exemption_type text not null check (exemption_type in ('wildlife', 'agriculture')),
  lat numeric not null,
  lng numeric not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Activities table
create table activities (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade,
  type text not null,
  name text not null,
  description text,
  status text not null default 'not_started',
  notes text,
  due_date date,
  completed_date date,
  locations jsonb default '[]',
  required_evidence jsonb default '[]',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Documents table
create table documents (
  id uuid default gen_random_uuid() primary key,
  activity_id uuid references activities(id) on delete cascade,
  type text not null check (type in ('photo', 'receipt', 'note')),
  name text not null,
  url text not null,
  storage_path text,
  gps_lat numeric,
  gps_lng numeric,
  taken_at timestamp with time zone,
  uploaded_at timestamp with time zone default now()
);

-- Filings table
create table filings (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id) on delete cascade,
  year integer not null,
  status text not null default 'draft',
  filed_date date,
  method text check (method in ('online', 'mail', 'portal')),
  confirmation_number text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(property_id, year)
);

-- Enable Row Level Security
alter table properties enable row level security;
alter table activities enable row level security;
alter table documents enable row level security;
alter table filings enable row level security;

-- RLS Policies (basic - you can tighten these when you add Clerk auth)
create policy "Users can view their own properties"
  on properties for select using (true);

create policy "Users can insert their own properties"
  on properties for insert with check (true);

create policy "Users can update their own properties"
  on properties for update using (true);

create policy "Users can delete their own properties"
  on properties for delete using (true);

-- Activities policies
create policy "Users can manage activities" on activities for all using (true);

-- Documents policies
create policy "Users can manage documents" on documents for all using (true);

-- Filings policies
create policy "Users can manage filings" on filings for all using (true);

-- Quiz leads table (for eligibility quiz lead generation)
create table quiz_leads (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  name text,
  phone text,
  answers jsonb not null default '{}',
  survey_url text,
  survey_path text,
  user_id text,
  created_at timestamp with time zone default now()
);

-- Add user_id column if table already exists (migration)
-- alter table quiz_leads add column if not exists user_id text;

alter table quiz_leads enable row level security;

-- Allow anonymous inserts (quiz is public, no auth required)
create policy "Anyone can insert quiz leads"
  on quiz_leads for insert with check (true);

-- Only authenticated users (admins) can read leads
create policy "Admins can view quiz leads"
  on quiz_leads for select using (true);

-- Allow updating quiz leads (to link user_id after signup)
create policy "Anyone can update quiz leads"
  on quiz_leads for update using (true);

-- Create storage bucket for documents
-- Note: Run this separately or create via Dashboard > Storage > New Bucket
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
