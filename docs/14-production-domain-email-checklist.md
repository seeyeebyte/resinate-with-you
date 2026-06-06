# Production Domain And Email Checklist

Use this checklist for the live `resinatewithyou.com` launch setup.

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

## Live Test

1. Submit a test application.
2. Approve it from `/admin/applications?token=YOUR_ADMIN_REVIEW_TOKEN`.
3. Confirm the password setup email links to `https://resinatewithyou.com/artist/set-password`.
4. Set a password, sign in, publish one test product, then hide and restore it from `/admin/products?token=YOUR_ADMIN_REVIEW_TOKEN`.
