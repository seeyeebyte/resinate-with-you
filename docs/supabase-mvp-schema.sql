-- Resinate With You MVP Supabase schema
-- Copy this full file into Supabase SQL Editor, then click Run.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.enforce_artist_product_limit()
returns trigger as $$
begin
  if (
    select count(*)
    from public.products
    where artist_id = new.artist_id
    and id <> new.id
  ) >= 15 then
    raise exception 'Each artist can have at most 15 products.';
  end if;

  return new;
end;
$$ language plpgsql;

create or replace function public.enforce_product_image_limit()
returns trigger as $$
begin
  if (
    select count(*)
    from public.product_images
    where product_id = new.product_id
    and id <> new.id
  ) >= 5 then
    raise exception 'Each product can have at most 5 images.';
  end if;

  return new;
end;
$$ language plpgsql;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'artist' check (role in ('artist', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  contact_name text,
  email text not null,
  country text,
  city text,
  instagram_url text,
  website_url text,
  contact_link_label text,
  shop_url text,
  categories text[] not null default '{}',
  sample_image_urls text[] not null default '{}',
  accepts_custom boolean not null default false,
  ships_international boolean not null default false,
  price_range text,
  bio text,
  authorization_accepted boolean not null default false,
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'needs_info', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  application_id uuid references public.applications(id) on delete set null,
  brand_name text not null,
  contact_name text,
  contact_email text,
  slug text not null unique,
  bio text,
  country text,
  city text,
  avatar_url text,
  banner_url text,
  instagram_url text,
  website_url text,
  contact_link_label text,
  shop_url text,
  categories text[] not null default '{}',
  sample_image_urls text[] not null default '{}',
  accepts_custom boolean not null default false,
  ships_international boolean not null default false,
  status text not null default 'approved' check (status in ('approved', 'hidden', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.artists add column if not exists contact_name text;
alter table public.artists add column if not exists contact_email text;
alter table public.artists add column if not exists contact_link_label text;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text,
  category text,
  price_text text,
  external_url text not null,
  status text not null default 'approved' check (status in ('draft', 'pending', 'approved', 'needs_changes', 'hidden')),
  is_featured boolean not null default false,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.featured_products (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title_override text,
  subtitle_override text,
  image_override_url text,
  image_override_alt text,
  image_position text,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id)
);

create table if not exists public.clicks (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.artists(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  target_url text not null,
  source_page text,
  created_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at before update on public.applications
for each row execute function public.set_updated_at();

drop trigger if exists artists_set_updated_at on public.artists;
create trigger artists_set_updated_at before update on public.artists
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists featured_products_set_updated_at on public.featured_products;
create trigger featured_products_set_updated_at before update on public.featured_products
for each row execute function public.set_updated_at();

drop trigger if exists products_enforce_artist_product_limit on public.products;
create trigger products_enforce_artist_product_limit before insert or update of artist_id on public.products
for each row execute function public.enforce_artist_product_limit();

drop trigger if exists product_images_enforce_product_image_limit on public.product_images;
create trigger product_images_enforce_product_image_limit before insert or update of product_id on public.product_images
for each row execute function public.enforce_product_image_limit();

-- Before enabling this unique index on an existing project, check for duplicates:
-- select lower(email) as email, count(*)
-- from public.applications
-- group by lower(email)
-- having count(*) > 1;
create unique index if not exists applications_email_unique_idx on public.applications (lower(email));
create index if not exists applications_email_created_at_idx on public.applications (lower(email), created_at desc);
create index if not exists artists_slug_idx on public.artists (slug);
create index if not exists artists_status_idx on public.artists (status);
create index if not exists products_artist_id_idx on public.products (artist_id);
create index if not exists products_status_idx on public.products (status);
create index if not exists product_images_product_id_sort_order_idx on public.product_images (product_id, sort_order);
create index if not exists featured_products_active_sort_idx on public.featured_products (is_active, sort_order);
create index if not exists clicks_product_id_created_at_idx on public.clicks (product_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.artists enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.featured_products enable row level security;
alter table public.clicks enable row level security;

drop policy if exists "Public can read approved artists" on public.artists;
create policy "Public can read approved artists"
on public.artists for select
using (status = 'approved');

drop policy if exists "Public can read approved products" on public.products;
create policy "Public can read approved products"
on public.products for select
using (status = 'approved');

drop policy if exists "Public can read images for approved products" on public.product_images;
create policy "Public can read images for approved products"
on public.product_images for select
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
    and products.status = 'approved'
  )
);

drop policy if exists "Public can read active featured products" on public.featured_products;
create policy "Public can read active featured products"
on public.featured_products for select
using (is_active = true);

drop policy if exists "Public can create click records" on public.clicks;
create policy "Public can create click records"
on public.clicks for insert
with check (true);

drop policy if exists "Artists can read own profile" on public.profiles;
create policy "Artists can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Artists can update own profile" on public.profiles;
create policy "Artists can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Artists can read own artist record" on public.artists;
create policy "Artists can read own artist record"
on public.artists for select
using (user_id = auth.uid() or status = 'approved');

drop policy if exists "Artists can update own artist record" on public.artists;
create policy "Artists can update own artist record"
on public.artists for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Artists can read own products" on public.products;
create policy "Artists can read own products"
on public.products for select
using (
  status = 'approved'
  or exists (
    select 1 from public.artists
    where artists.id = products.artist_id
    and artists.user_id = auth.uid()
  )
);

drop policy if exists "Artists can create own products" on public.products;
create policy "Artists can create own products"
on public.products for insert
with check (
  exists (
    select 1 from public.artists
    where artists.id = products.artist_id
    and artists.user_id = auth.uid()
  )
);

drop policy if exists "Artists can update own products" on public.products;
create policy "Artists can update own products"
on public.products for update
using (
  exists (
    select 1 from public.artists
    where artists.id = products.artist_id
    and artists.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.artists
    where artists.id = products.artist_id
    and artists.user_id = auth.uid()
  )
);

drop policy if exists "Artists can read images for own products" on public.product_images;
create policy "Artists can read images for own products"
on public.product_images for select
using (
  exists (
    select 1
    from public.products
    join public.artists on artists.id = products.artist_id
    where products.id = product_images.product_id
    and (products.status = 'approved' or artists.user_id = auth.uid())
  )
);

drop policy if exists "Artists can create images for own products" on public.product_images;
create policy "Artists can create images for own products"
on public.product_images for insert
with check (
  exists (
    select 1
    from public.products
    join public.artists on artists.id = products.artist_id
    where products.id = product_images.product_id
    and artists.user_id = auth.uid()
  )
);

drop policy if exists "Artists can update images for own products" on public.product_images;
create policy "Artists can update images for own products"
on public.product_images for update
using (
  exists (
    select 1
    from public.products
    join public.artists on artists.id = products.artist_id
    where products.id = product_images.product_id
    and artists.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.products
    join public.artists on artists.id = products.artist_id
    where products.id = product_images.product_id
    and artists.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values
  ('application-photos', 'application-photos', true),
  ('featured-product-images', 'featured-product-images', true),
  ('product-images', 'product-images', true),
  ('artist-avatars', 'artist-avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read application photos" on storage.objects;
create policy "Public can read application photos"
on storage.objects for select
using (bucket_id = 'application-photos');

drop policy if exists "Public can read featured product images" on storage.objects;
create policy "Public can read featured product images"
on storage.objects for select
using (bucket_id = 'featured-product-images');

drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Public can read artist avatars" on storage.objects;
create policy "Public can read artist avatars"
on storage.objects for select
using (bucket_id = 'artist-avatars');

drop policy if exists "Artists can upload product images" on storage.objects;
create policy "Artists can upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images');

drop policy if exists "Artists can upload artist avatars" on storage.objects;
create policy "Artists can upload artist avatars"
on storage.objects for insert
with check (bucket_id = 'artist-avatars');
