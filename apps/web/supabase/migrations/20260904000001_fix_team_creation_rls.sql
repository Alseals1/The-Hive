-- Fix 1: Teams INSERT RLS — require can_create_team = true on the caller's profile
drop policy if exists "teams_insert_authenticated" on public.teams;

create policy "teams_insert_authenticated"
  on public.teams for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and can_create_team = true
    )
  );

-- Fix 2: Move can_create_team assignment into the server-side trigger.
-- Reads account_type from signup metadata; no client call needed.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, can_create_team)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'account_type') = 'organizer', false)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Fix 3: Freeze can_create_team after profile creation — prevents self-grant via API
create or replace function public.prevent_can_create_team_update()
returns trigger as $$
begin
  if new.can_create_team <> old.can_create_team then
    raise exception 'can_create_team cannot be changed after account creation';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists freeze_can_create_team on public.profiles;

create trigger freeze_can_create_team
  before update on public.profiles
  for each row execute function public.prevent_can_create_team_update();
