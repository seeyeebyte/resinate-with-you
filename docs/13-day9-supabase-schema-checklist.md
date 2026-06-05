# Day 9 Supabase Schema Checklist

Goal: create the live MVP database tables in Supabase.

## What To Do Today

1. Open Supabase and go to the project for Resinate With You.
2. Open SQL Editor, create a new query, and paste the full contents of:

```text
docs/supabase-mvp-schema.sql
```

3. Click Run once.
4. Open Table Editor and confirm these tables exist:

```text
profiles
applications
artists
products
product_images
featured_products
clicks
```

5. Open Storage and confirm these buckets exist and are public:

```text
application-photos
featured-product-images
product-images
artist-avatars
```

## Schema Rules Locked Today

- Each artist can have at most 15 products.
- Each product can have at most 5 images.
- Applications start as `submitted`.
- Products start as `approved` because approved artists can publish directly in the MVP.
- Public visitors can only read approved artists, approved products, approved product images, active featured products, and can create click records.
- The website server uses `SUPABASE_SERVICE_ROLE_KEY` for application upload and admin review actions.

## Acceptance Standard

Day 9 is complete when Supabase shows all seven tables, all four Storage buckets, and the SQL runs without errors.

If Supabase returns an error, copy the exact error text before trying repeated fixes.
