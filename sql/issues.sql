-- Create issues table
create table if not exists public.issues (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    error_message text,
    file_path text,
    line_number integer,
    test_name text,
    workflow_run_id text,
    workflow_name text,
    status text default 'open' check (status in ('open', 'closed', 'in_progress')),
    severity text default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    resolved_at timestamp with time zone,
    github_action_url text
);

-- Create RLS policies
alter table public.issues enable row level security;

create policy "Issues are viewable by everyone"
on public.issues for select
to authenticated
using (true);

create policy "Issues are insertable by authenticated users"
on public.issues for insert
to authenticated
with check (true);

create policy "Issues are updatable by authenticated users"
on public.issues for update
to authenticated
using (true);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger issues_updated_at
    before update on public.issues
    for each row
    execute procedure public.handle_updated_at();
