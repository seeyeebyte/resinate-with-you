# Production Domain, Email, And Live Artist Checklist

Use this checklist for the live `resinatewithyou.com` launch setup and the first real artist workflow test.

## Vercel Environment Variables

Set these in the Vercel project `resinate-with-you`:

```text
NEXT_PUBLIC_SITE_URL=https://resinatewithyou.com
EMAIL_FROM=support@resinatewithyou.com
RESEND_API_KEY=your Resend API key
ADMIN_NOTIFICATION_EMAIL=your admin inbox
```

Keep the existing Supabase values in Vercel too:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_REVIEW_TOKEN
SUPABASE_APPLICATION_PHOTOS_BUCKET=application-photos
SUPABASE_FEATURED_PRODUCT_IMAGES_BUCKET=featured-product-images
SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
SUPABASE_ARTIST_AVATARS_BUCKET=artist-avatars
```

## Supabase Auth URLs

In Supabase `Authentication -> URL Configuration`:

```text
Site URL:
https://resinatewithyou.com

Redirect URLs:
https://resinatewithyou.com/artist/set-password
https://www.resinatewithyou.com/artist/set-password
http://localhost:3000/artist/set-password
```

## Resend Sender

In Resend:

1. Verify the `resinatewithyou.com` sending domain.
2. Use `support@resinatewithyou.com` as `EMAIL_FROM`.
3. Send one approval email to a test artist before inviting real artists.

Production email is considered ready only after the approval email arrives in the test artist inbox and the password setup link opens the live site:

```text
https://resinatewithyou.com/artist/set-password
```

## Live Artist Workflow Test

1. Submit a test application.
2. Approve it from `/admin/applications?token=YOUR_ADMIN_REVIEW_TOKEN`.
3. Confirm the password setup email links to `https://resinatewithyou.com/artist/set-password`.
4. Set a password from the emailed link.
5. Sign in from `/artist/login`.
6. Open `/artist/dashboard` and confirm the approved artist profile appears.
7. Publish one test product from `/artist/products/new`.
8. Confirm the product appears in `/products`, on the artist detail page, and on the product detail page.
9. Hide and restore the product from `/admin/products?token=YOUR_ADMIN_REVIEW_TOKEN`.
10. If the product should appear on the homepage, add it from `/admin/featured-products?token=YOUR_ADMIN_REVIEW_TOKEN`.

## First Public Content Pass

Before inviting more artists, prepare:

1. 3-5 real products with clear images.
2. 2-3 polished artist profiles with avatars or strong initials fallback.
3. Homepage Favorite Finds using real approved products.
4. One mobile check of the homepage, `/apply`, `/products`, one artist page, and one product page.

## Known Temporary Protection

The admin pages still use `ADMIN_REVIEW_TOKEN` as MVP protection. This is acceptable for the first controlled launch, but the next hardening pass should replace it with a real admin login.
