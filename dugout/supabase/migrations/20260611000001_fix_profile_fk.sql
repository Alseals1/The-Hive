-- Allow users to insert their own profile as a fallback if the trigger failed
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- Fix the trigger to handle conflicts gracefully (prevents cascade failure on re-signup)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Backfill any auth users that are missing a profiles row
insert into public.profiles (id)
select id from auth.users
where not exists (
  select 1 from public.profiles p where p.id = auth.users.id
)
on conflict (id) do nothing;
