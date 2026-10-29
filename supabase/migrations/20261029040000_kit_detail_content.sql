create table public.kit_detail_content (
  id uuid primary key default gen_random_uuid(),
  kit_id text not null unique,
  draft_content jsonb not null,
  published_content jsonb,
  updated_by uuid references public.admin_profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create trigger kit_detail_content_touch_updated_at
  before update on public.kit_detail_content
  for each row execute function public.touch_updated_at();

create trigger kit_detail_content_audit_row_change
  after insert or update or delete on public.kit_detail_content
  for each row execute function public.record_admin_row_change();

alter table public.kit_detail_content enable row level security;

create policy "Authorized admins can read kit detail content"
  on public.kit_detail_content for select to authenticated
  using (public.has_admin_permission('website'));
create policy "Public can read published kit detail content"
  on public.kit_detail_content for select to anon, authenticated
  using (published_content is not null);
create policy "Authorized admins can create kit detail content"
  on public.kit_detail_content for insert to authenticated
  with check (public.has_admin_permission('website'));
create policy "Authorized admins can update kit detail content"
  on public.kit_detail_content for update to authenticated
  using (public.has_admin_permission('website'))
  with check (public.has_admin_permission('website'));
create policy "Authorized admins can delete kit detail content"
  on public.kit_detail_content for delete to authenticated
  using (public.has_admin_permission('website'));

grant select (kit_id, published_content, published_at) on public.kit_detail_content to anon;
grant select, insert, update, delete on public.kit_detail_content to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kit-content-media',
  'kit-content-media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view published kit media"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'kit-content-media');
create policy "Website editors can upload kit media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'kit-content-media' and public.has_admin_permission('website'));
create policy "Website editors can update kit media"
  on storage.objects for update to authenticated
  using (bucket_id = 'kit-content-media' and public.has_admin_permission('website'))
  with check (bucket_id = 'kit-content-media' and public.has_admin_permission('website'));
create policy "Website editors can delete kit media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'kit-content-media' and public.has_admin_permission('website'));
