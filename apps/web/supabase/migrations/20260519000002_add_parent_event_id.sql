alter table public.events
  add column if not exists parent_event_id uuid
    references public.events(id) on delete cascade;

create index if not exists events_parent_event_id_idx
  on public.events (parent_event_id);
