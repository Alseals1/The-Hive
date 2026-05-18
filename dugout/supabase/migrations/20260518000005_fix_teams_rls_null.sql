-- Better fix: allow NULL created_by at insert time (trigger will set it)

-- Drop and recreate the insert policy to allow NULL
drop policy if exists "teams_insert_authenticated" on public.teams;

create policy "teams_insert_authenticated"
  on public.teams for insert
  to authenticated
  with check (created_by is null or created_by = auth.uid());

-- Keep the before insert trigger to set created_by and ensure profile exists
create or replace function public.set_teams_created_by()
returns trigger as $$
begin
  new.created_by = auth.uid();
  
  -- Ensure profile exists for this user (upsert to avoid conflicts)
  insert into public.profiles (id)
  values (auth.uid())
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists before_teams_insert on public.teams;

create trigger before_teams_insert
  before insert on public.teams
  for each row 
  execute function public.set_teams_created_by();
