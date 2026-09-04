-- Fix #60: scope profiles SELECT to self + teammates only.
-- The previous policy (using: true) allowed any authenticated user to
-- read every profile in the app — including children's names on other teams.

-- Helper: returns true if auth.uid() shares any team with p_user_id.
-- Security definer so it reads team_members without going through RLS,
-- matching the pattern of is_team_member / is_team_admin.
create or replace function public.shares_team_with(p_user_id uuid)
returns boolean as $$
  select exists (
    select 1
    from   public.team_members a
    join   public.team_members b on b.team_id = a.team_id
    where  a.user_id = auth.uid()
      and  b.user_id = p_user_id
  );
$$ language sql security definer stable;

-- Replace the open policy with a scoped one.
drop policy if exists "profiles_select_authenticated" on public.profiles;

create policy "profiles_select_teammates"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or public.shares_team_with(id)
  );
