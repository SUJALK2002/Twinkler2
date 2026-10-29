# Supabase setup

## Configure the app

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the project's API settings.
3. Keep the Supabase service-role key out of Vite environment variables and client code.

## Apply the database migration

Run the SQL migrations in `migrations/` in filename order using the Supabase CLI or the project's SQL editor. `20261027030000_admin_portal.sql` creates the admin profile, CRM, school, kit, event, media, content, and audit tables; the dashboard RPC; and RLS policies. `20261029040000_kit_detail_content.sql` adds the draft/published kit-detail content store and the public media bucket used by the Kit Detail Content editor.

Admins with the `website` permission can edit each class page at `/admin/kit-content`. The editor manages the welcome heading and robot message, kit imagery, overview text and stats, section visibility/order/content, and each section's component, project, gallery, specification, or LMS items. Items and sections can be added, edited, reordered, hidden, and deleted; image and video URLs can be entered directly or uploaded. CTA labels and destinations are editable; destinations accept internal paths or `https://`, `mailto:`, and `tel:` links.

Save drafts without changing the public page, then publish to update that class page. Public visitors can read published content and media only. In local development without Supabase, drafts and published previews are stored in browser local storage; configure Supabase and apply the migration for shared, persistent content and uploaded media.

Configure Supabase Auth email confirmation and the site's allowed redirect URLs before enabling admin registration. Include `/admin/login` and `/admin/reset-password` for local and deployed origins so confirmation and password recovery links can return to the app.

## Provision the first administrator

1. Register the intended administrator at `/admin/register`.
2. Confirm their email using the Supabase email.
3. In the SQL editor, run the bootstrap `UPDATE public.admin_profiles ...` statement at the end of the migration, replacing `admin@example.com` with the verified administrator's email.
4. Sign in at `/admin/login`.

Self-registration creates a pending account only. It does not grant admin access. A super administrator must approve additional accounts in `admin_profiles` and assign the required permissions. Grant the `super_admin` role only through a trusted Supabase SQL/admin process.

Password recovery starts from `/admin/login`; the emailed link opens `/admin/reset-password` to set and confirm a new password.

Local development without Supabase uses a development-only demo login. It is not available in production builds and does not create database permissions.
