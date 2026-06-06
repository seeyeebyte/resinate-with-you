# Supabase Live Setup Guide

This guide is for non-technical setup. Follow it slowly, one screen at a time.

## What You Are Setting Up

Supabase will store:

- artist applications
- approved artist profiles
- products and product images
- homepage Favorite Finds
- simple click records
- artist email/password login
- artist password setup and reset emails

The website already has fallback mock data, so it will not break while Supabase is empty.

## Step 1: Open Or Create The Supabase Project

1. Go to `https://supabase.com/dashboard`.
2. Open your existing project, or create a new project named `resinate-with-you`.
3. Wait until the project says it is ready.

## Step 2: Run The Database SQL

1. In the Supabase left sidebar, open `SQL Editor`.
2. Click `New query`.
3. Open this project file:

```text
docs/supabase-mvp-schema.sql
```

4. Copy the entire file.
5. Paste it into Supabase SQL Editor.
6. Click `Run`.

You should see a success message. If Supabase says a policy or bucket already exists, run the file again only after sharing the error text so we can adjust it safely.

This SQL creates:

- `profiles`
- `applications`
- `artists`
- `products`
- `product_images`
- `featured_products`
- `clicks`
- public Storage buckets for uploaded images
- database safeguards for 15 products per artist and 5 images per product

If the project already has tables, the same SQL also adds newer profile fields such as `artist_type` and `studio_address` without deleting existing rows.

## Step 3: Confirm Storage Buckets

1. Open `Storage` in Supabase.
2. Confirm these buckets exist:

```text
application-photos
featured-product-images
product-images
artist-avatars
```

3. Confirm all four are public.

If they do not appear, create them manually in Storage with the same names and set them as public.

## Step 4: Copy Supabase Keys

1. Open `Project Settings`.
2. Open `API`.
3. Copy these values:

```text
Project URL
anon public key
service_role key
```

Important: keep the `service_role key` private. Do not paste it into public pages, screenshots, or GitHub.

## Step 5: Fill `.env.local`

Create a file named `.env.local` in the project root if it does not exist.

Use this shape:

```bash
NEXT_PUBLIC_SUPABASE_URL=PASTE_PROJECT_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_ANON_PUBLIC_KEY_HERE
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=PASTE_SERVICE_ROLE_KEY_HERE
ADMIN_REVIEW_TOKEN=choose-a-private-admin-token
SUPABASE_APPLICATION_PHOTOS_BUCKET=application-photos
SUPABASE_FEATURED_PRODUCT_IMAGES_BUCKET=featured-product-images
SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
SUPABASE_ARTIST_AVATARS_BUCKET=artist-avatars
RESEND_API_KEY=
ADMIN_NOTIFICATION_EMAIL=
EMAIL_FROM=
```

For `ADMIN_REVIEW_TOKEN`, choose something private, for example a long phrase without spaces.
For local testing, keep `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

For Vercel production, set:

```text
NEXT_PUBLIC_SITE_URL=https://resinatewithyou.com
EMAIL_FROM=support@resinatewithyou.com
```

After saving `.env.local`, restart the local website preview.

## Step 6: Allow Password Redirect URLs

Password setup and forgot-password emails send artists to:

```text
/artist/set-password
```

In Supabase:

1. Open `Authentication`.
2. Open `URL Configuration`.
3. Set the Site URL to:

```text
https://resinatewithyou.com
```

4. Add these redirect URLs:

```text
https://resinatewithyou.com/artist/set-password
https://www.resinatewithyou.com/artist/set-password
http://localhost:3000/artist/set-password
```

5. If Vercel currently shows another production URL, keep it only as a temporary testing redirect. The preferred public password links should use:

```text
https://resinatewithyou.com/artist/set-password
```

## Step 7: Test Application Submission

1. Open `/apply`.
2. Submit one test artist application.
3. Upload exactly 3 product photos.
4. Go to Supabase `Table Editor`.
5. Open `applications`.
6. Confirm the new application appears with `status = submitted`.
7. If you selected `Offline studio`, confirm `artist_type` and optional `studio_address` were saved.

Current status: this has been tested once with a live submission and image upload. Repeat this step only when checking a new form change.

## Step 8: Test Admin Review

Open:

```text
/admin/applications?token=YOUR_ADMIN_REVIEW_TOKEN
```

Approve the test application.

Then check Supabase:

- `applications.status` should become `approved`
- `artists` should have a new artist record
- `profiles` should have a matching artist profile
- the `artists.user_id` should be connected to the Supabase Auth user

Approval now creates or reuses a Supabase Auth user and sends a password setup email. Email may be skipped until Resend is configured. That is okay for database testing, but a real artist cannot self-set a password until email is configured.

Current status: a test application has been approved, the matching artist appeared publicly, and the status lookup shows `approved`.

Duplicate email behavior has also been tested: the form blocks repeat submissions for the same email.

## Step 9: Test Artist Password Email

After Resend is configured:

1. Approve one test application from `/admin/applications?token=YOUR_ADMIN_REVIEW_TOKEN`.
2. Open the password setup email.
3. Click the setup link.
4. Set a password at `/artist/set-password`.
5. Sign in at `/artist/login`.
6. Try `Forgot password?` from the login page and confirm a reset email arrives.

## Step 10: Test Favorite Finds Manager

The Favorite Finds manager needs at least one approved product.

Before product submission is built, you can add one test product manually in Supabase:

1. Open `artists` and copy one approved artist `id`.
2. Open `products`.
3. Insert a row:

```text
artist_id: paste the artist id
title: Test Resin Piece
slug: test-resin-piece
description: A test product for homepage setup.
category: Keychains
price_text: $20 - $30
external_url: https://example.com
status: approved
is_featured: false
```

4. Open `/admin/featured-products?token=YOUR_ADMIN_REVIEW_TOKEN`.
5. Choose the approved product.
6. Save.
7. Refresh the homepage and check `Favorite Finds This Week`.

## Step 11: Approved Artist Product Publishing

Approved artists can publish products directly. The MVP does not need a separate admin product review backend.

The product publishing flow should support:

- product title
- description
- category
- price range in USD
- external shop/contact link
- 1 to 5 product photos, max 2 MB each
- style tags
- accepts custom orders
- worldwide shipping

Submitted products should save as public approved products for that approved artist.

Current status: product submission/display has been tested once. Continue by polishing product publishing and image handling.

Artist upload URL:

```text
/artist/products/new
```

This page requires the artist to be signed in.

## Step 12: Test Admin Product Management

Open:

```text
/admin/products?token=YOUR_ADMIN_REVIEW_TOKEN
```

Use this page to:

- see all artist products
- filter live, hidden, or needs-changes products
- hide an unsuitable product
- restore a hidden product
- save moderation notes

If a product is hidden, the site also turns off its active homepage Featured Finds placement.

## Troubleshooting

### The admin page says Supabase service config is missing

Check:

- `.env.local` exists
- `SUPABASE_SERVICE_ROLE_KEY` is filled
- the local preview was restarted after editing `.env.local`

### Upload fails

Check:

- the bucket exists
- the bucket is public
- the file is JPG, PNG, or WebP

### Application submits but email does not send

This is expected until Resend is configured. Database actions still work.

### Password setup link does not open

Check Supabase `Authentication -> URL Configuration`. These redirect URLs should exist:

```text
https://resinatewithyou.com/artist/set-password
https://www.resinatewithyou.com/artist/set-password
http://localhost:3000/artist/set-password
```

### Homepage still shows mock data

This is expected until there are active rows in `featured_products`.
