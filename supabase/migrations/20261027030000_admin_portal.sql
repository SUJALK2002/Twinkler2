create extension if not exists pgcrypto;

create type public.admin_role as enum (
  'pending',
  'super_admin',
  'admin',
  'editor',
  'viewer'
);

create table public.admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.admin_role not null default 'pending',
  active boolean not null default false,
  permissions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  school_name text not null,
  city text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'converted', 'closed')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text not null default 'prospect'
    check (status in ('prospect', 'demo_scheduled', 'pilot', 'active', 'inactive')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text unique,
  description text not null default '',
  total_stock integer not null default 0 check (total_stock >= 0),
  available_stock integer not null default 0 check (available_stock >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint available_stock_not_above_total check (available_stock <= total_stock)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text not null default 'demonstration',
  school_id uuid references public.schools (id) on delete set null,
  starts_at timestamptz not null,
  location text,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kit_deliveries (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid references public.kits (id) on delete set null,
  school_id uuid references public.schools (id) on delete set null,
  quantity integer not null check (quantity > 0),
  status text not null default 'pending'
    check (status in ('pending', 'in_transit', 'delivered', 'cancelled')),
  expected_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kit_allocations (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid not null references public.kits (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  allocated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  item_type text not null check (item_type in ('testimonial', 'image', 'video', 'announcement')),
  body text not null default '',
  asset_path text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.website_content (
  id uuid primary key default gen_random_uuid(),
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  updated_by uuid references public.admin_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.admin_profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index enquiries_created_at_idx on public.enquiries (created_at desc);
create index enquiries_status_idx on public.enquiries (status);
create index schools_status_idx on public.schools (status);
create index kits_stock_idx on public.kits (available_stock, low_stock_threshold);
create index events_starts_at_idx on public.events (starts_at);
create index kit_deliveries_status_idx on public.kit_deliveries (status, expected_at);
create index kit_allocations_school_idx on public.kit_allocations (school_id, allocated_at desc);
create index media_items_published_idx on public.media_items (published, created_at desc);
create index website_content_status_idx on public.website_content (status, updated_at desc);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.create_pending_admin_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.admin_profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger auth_user_create_pending_admin
  after insert on auth.users
  for each row execute function public.create_pending_admin_profile();

create or replace function public.has_admin_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles p
    where p.id = (select auth.uid())
      and p.active
      and p.role in ('super_admin', 'admin', 'editor', 'viewer')
  );
$$;

create or replace function public.has_admin_permission(required_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles p
    where p.id = (select auth.uid())
      and p.active
      and (
        p.role = 'super_admin'
        or required_permission = any(p.permissions)
      )
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles p
    where p.id = (select auth.uid())
      and p.active
      and p.role = 'super_admin'
  );
$$;

create or replace function public.write_admin_audit_log(
  action_name text,
  entity_name text,
  entity_uuid uuid default null,
  extra_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  values ((select auth.uid()), action_name, entity_name, entity_uuid, coalesce(extra_details, '{}'::jsonb));
end;
$$;

create or replace function public.record_admin_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_id uuid;
begin
  if tg_op = 'DELETE' then
    row_id = old.id;
  else
    row_id = new.id;
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  values (
    (select auth.uid()),
    lower(tg_op),
    tg_table_name,
    row_id,
    jsonb_build_object('summary', tg_op || ' record')
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.get_admin_dashboard_snapshot(
  range_start timestamptz default now() - interval '30 days',
  range_end timestamptz default now()
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  snapshot jsonb;
begin
  if not public.has_admin_access() then
    raise exception 'Administrator access is required';
  end if;

  select jsonb_build_object(
    'metrics', jsonb_build_object(
      'total_enquiries', (select count(*) from public.enquiries),
      'new_enquiries', (select count(*) from public.enquiries where status = 'new'),
      'active_schools', (select count(*) from public.schools where status = 'active'),
      'upcoming_demos', (select count(*) from public.events where status = 'scheduled' and starts_at >= now()),
      'total_kits', coalesce((select sum(total_stock) from public.kits), 0),
      'available_stock', coalesce((select sum(available_stock) from public.kits), 0),
      'low_stock_alerts', (select count(*) from public.kits where available_stock <= low_stock_threshold),
      'pending_deliveries', (select count(*) from public.kit_deliveries where status in ('pending', 'in_transit'))
    ),
    'enquiries_by_month', coalesce((
      select jsonb_agg(jsonb_build_object('month', to_char(bucket, 'Mon DD'), 'value', amount) order by bucket)
      from (
        select date_trunc('day', created_at) as bucket, count(*) as amount
        from public.enquiries
        where created_at >= range_start and created_at <= range_end
        group by 1
      ) grouped_enquiries
    ), '[]'::jsonb),
    'enquiries_by_status', coalesce((
      select jsonb_agg(jsonb_build_object('name', status, 'value', amount) order by status)
      from (select status, count(*) as amount from public.enquiries group by status) grouped_status
    ), '[]'::jsonb),
    'schools_by_month', coalesce((
      select jsonb_agg(jsonb_build_object('month', to_char(bucket, 'Mon DD'), 'value', amount) order by bucket)
      from (
        select date_trunc('day', created_at) as bucket, count(*) as amount
        from public.schools
        where created_at >= range_start and created_at <= range_end
        group by 1
      ) grouped_schools
    ), '[]'::jsonb),
    'kits_by_school', coalesce((
      select jsonb_agg(jsonb_build_object('name', name, 'value', amount) order by amount desc)
      from (
        select s.name, sum(a.quantity) as amount
        from public.kit_allocations a
        join public.schools s on s.id = a.school_id
        where a.allocated_at >= range_start and a.allocated_at <= range_end
        group by s.id, s.name
        order by amount desc
        limit 8
      ) allocations_by_school
    ), '[]'::jsonb),
    'inventory_distribution', jsonb_build_array(
      jsonb_build_object('name', 'Available', 'value', coalesce((select sum(available_stock) from public.kits), 0)),
      jsonb_build_object('name', 'Allocated', 'value', greatest(coalesce((select sum(total_stock - available_stock) from public.kits), 0), 0)),
      jsonb_build_object('name', 'Low stock kits', 'value', (select count(*) from public.kits where available_stock <= low_stock_threshold))
    ),
    'demos_by_month', coalesce((
      select jsonb_agg(jsonb_build_object('month', to_char(bucket, 'Mon DD'), 'demos', amount) order by bucket)
      from (
        select date_trunc('day', starts_at) as bucket, count(*) as amount
        from public.events
        where status = 'scheduled' and starts_at >= range_start and starts_at <= range_end
        group by 1
      ) grouped_events
    ), '[]'::jsonb),
    'recent_activity', coalesce((
      select jsonb_agg(jsonb_build_object(
        'title', action || ' · ' || entity_type,
        'meta', coalesce(details ->> 'summary', to_char(created_at, 'DD Mon, HH12:MI AM'))
      ) order by created_at desc)
      from (
        select action, entity_type, details, created_at
        from public.audit_logs
        order by created_at desc
        limit 6
      ) recent_logs
    ), '[]'::jsonb)
  ) into snapshot;

  return snapshot;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['enquiries', 'schools', 'kits', 'events', 'kit_deliveries', 'media_items', 'website_content'] loop
    execute format('create trigger %I_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()', table_name, table_name);
    execute format('create trigger %I_audit_row_change after insert or update or delete on public.%I for each row execute function public.record_admin_row_change()', table_name, table_name);
  end loop;
  execute 'create trigger admin_profiles_audit_row_change after update on public.admin_profiles for each row execute function public.record_admin_row_change()';
  execute 'create trigger kit_allocations_audit_row_change after insert or update or delete on public.kit_allocations for each row execute function public.record_admin_row_change()';
end;
$$;

alter table public.admin_profiles enable row level security;
alter table public.enquiries enable row level security;
alter table public.schools enable row level security;
alter table public.kits enable row level security;
alter table public.events enable row level security;
alter table public.kit_deliveries enable row level security;
alter table public.kit_allocations enable row level security;
alter table public.media_items enable row level security;
alter table public.website_content enable row level security;
alter table public.audit_logs enable row level security;

create policy "Admins can read their own profile or authorized profiles"
  on public.admin_profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_super_admin());

create policy "Super admins can update admin profiles"
  on public.admin_profiles for update to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "Authorized admins can read enquiries"
  on public.enquiries for select to authenticated
  using (public.has_admin_permission('enquiries'));
create policy "Authorized admins can create enquiries"
  on public.enquiries for insert to authenticated
  with check (public.has_admin_permission('enquiries'));
create policy "Authorized admins can update enquiries"
  on public.enquiries for update to authenticated
  using (public.has_admin_permission('enquiries'))
  with check (public.has_admin_permission('enquiries'));
create policy "Authorized admins can delete enquiries"
  on public.enquiries for delete to authenticated
  using (public.has_admin_permission('enquiries'));

create policy "Authorized admins can read schools"
  on public.schools for select to authenticated
  using (public.has_admin_permission('schools'));
create policy "Authorized admins can create schools"
  on public.schools for insert to authenticated
  with check (public.has_admin_permission('schools'));
create policy "Authorized admins can update schools"
  on public.schools for update to authenticated
  using (public.has_admin_permission('schools'))
  with check (public.has_admin_permission('schools'));
create policy "Authorized admins can delete schools"
  on public.schools for delete to authenticated
  using (public.has_admin_permission('schools'));

create policy "Authorized admins can read kits"
  on public.kits for select to authenticated
  using (public.has_admin_permission('kits'));
create policy "Authorized admins can create kits"
  on public.kits for insert to authenticated
  with check (public.has_admin_permission('kits'));
create policy "Authorized admins can update kits"
  on public.kits for update to authenticated
  using (public.has_admin_permission('kits'))
  with check (public.has_admin_permission('kits'));
create policy "Authorized admins can delete kits"
  on public.kits for delete to authenticated
  using (public.has_admin_permission('kits'));

create policy "Authorized admins can read events"
  on public.events for select to authenticated
  using (public.has_admin_permission('schedule'));
create policy "Authorized admins can create events"
  on public.events for insert to authenticated
  with check (public.has_admin_permission('schedule'));
create policy "Authorized admins can update events"
  on public.events for update to authenticated
  using (public.has_admin_permission('schedule'))
  with check (public.has_admin_permission('schedule'));
create policy "Authorized admins can delete events"
  on public.events for delete to authenticated
  using (public.has_admin_permission('schedule'));

create policy "Authorized admins can read kit deliveries"
  on public.kit_deliveries for select to authenticated
  using (public.has_admin_permission('kits'));
create policy "Authorized admins can create kit deliveries"
  on public.kit_deliveries for insert to authenticated
  with check (public.has_admin_permission('kits'));
create policy "Authorized admins can update kit deliveries"
  on public.kit_deliveries for update to authenticated
  using (public.has_admin_permission('kits'))
  with check (public.has_admin_permission('kits'));
create policy "Authorized admins can delete kit deliveries"
  on public.kit_deliveries for delete to authenticated
  using (public.has_admin_permission('kits'));

create policy "Authorized admins can read kit allocations"
  on public.kit_allocations for select to authenticated
  using (public.has_admin_permission('kits'));
create policy "Authorized admins can create kit allocations"
  on public.kit_allocations for insert to authenticated
  with check (public.has_admin_permission('kits'));
create policy "Authorized admins can update kit allocations"
  on public.kit_allocations for update to authenticated
  using (public.has_admin_permission('kits'))
  with check (public.has_admin_permission('kits'));
create policy "Authorized admins can delete kit allocations"
  on public.kit_allocations for delete to authenticated
  using (public.has_admin_permission('kits'));

create policy "Authorized admins can read media"
  on public.media_items for select to authenticated
  using (public.has_admin_permission('media'));
create policy "Authorized admins can create media"
  on public.media_items for insert to authenticated
  with check (public.has_admin_permission('media'));
create policy "Authorized admins can update media"
  on public.media_items for update to authenticated
  using (public.has_admin_permission('media'))
  with check (public.has_admin_permission('media'));
create policy "Authorized admins can delete media"
  on public.media_items for delete to authenticated
  using (public.has_admin_permission('media'));

create policy "Authorized admins can read website content"
  on public.website_content for select to authenticated
  using (public.has_admin_permission('website'));
create policy "Public can read published website content"
  on public.website_content for select to anon, authenticated
  using (status = 'published');
create policy "Authorized admins can create website content"
  on public.website_content for insert to authenticated
  with check (public.has_admin_permission('website'));
create policy "Authorized admins can update website content"
  on public.website_content for update to authenticated
  using (public.has_admin_permission('website'))
  with check (public.has_admin_permission('website'));
create policy "Authorized admins can delete website content"
  on public.website_content for delete to authenticated
  using (public.has_admin_permission('website'));

create policy "Authorized admins can read audit logs"
  on public.audit_logs for select to authenticated
  using (public.has_admin_permission('audit_logs'));
create policy "Active admins can append audit logs"
  on public.audit_logs for insert to authenticated
  with check (public.has_admin_access() and actor_id = (select auth.uid()));

insert into storage.buckets (id, name, public)
values ('admin-media', 'admin-media', false)
on conflict (id) do nothing;

create policy "Authorized admins can read admin media"
  on storage.objects for select to authenticated
  using (bucket_id = 'admin-media' and public.has_admin_permission('media'));
create policy "Authorized admins can upload admin media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'admin-media' and public.has_admin_permission('media'));
create policy "Authorized admins can update admin media"
  on storage.objects for update to authenticated
  using (bucket_id = 'admin-media' and public.has_admin_permission('media'))
  with check (bucket_id = 'admin-media' and public.has_admin_permission('media'));
create policy "Authorized admins can delete admin media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'admin-media' and public.has_admin_permission('media'));

grant usage on schema public to authenticated;
grant usage on schema public to anon;
grant select, update on public.admin_profiles to authenticated;
grant select, insert, update, delete on public.enquiries, public.schools, public.kits, public.events, public.kit_deliveries, public.kit_allocations, public.media_items, public.website_content to authenticated;
grant select, insert on public.audit_logs to authenticated;
grant select on public.website_content to anon;
revoke all on function public.has_admin_access() from public, anon;
revoke all on function public.has_admin_permission(text) from public, anon;
revoke all on function public.is_super_admin() from public, anon;
revoke all on function public.write_admin_audit_log(text, text, uuid, jsonb) from public, anon;
revoke all on function public.get_admin_dashboard_snapshot(timestamptz, timestamptz) from public, anon;
grant execute on function public.has_admin_access() to authenticated;
grant execute on function public.has_admin_permission(text) to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.write_admin_audit_log(text, text, uuid, jsonb) to authenticated;
grant execute on function public.get_admin_dashboard_snapshot(timestamptz, timestamptz) to authenticated;

-- Create the first privileged administrator only after signup and email verification.
-- Replace the email with the intended administrator account before running:
-- update public.admin_profiles
-- set role = 'super_admin', active = true,
--     permissions = array['dashboard','website','enquiries','schools','kits','schedule','media','users','settings','audit_logs']
-- where email = 'admin@example.com';
