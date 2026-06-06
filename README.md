# Resin Artist Discovery Platform MVP

Brand name: Resinate With You

Main slogan: Discover resin artists. Create pieces together.

This is the formal Next.js MVP for a creator discovery, co-creation, and traffic-referral platform for handmade resin pieces and independent resin artists.

The first implementation round includes:

- Homepage with hero, Favorite Finds, directory preview, and artist application entry
- Artist Directory with mock-data search and filters
- Artist detail pages
- Product detail pages
- Artist application form prepared to write into Supabase `applications`
- Migrated planning docs in `docs/`
- Migrated visual asset in `public/assets/`
- Project materials folders in `project-materials/`

The platform does not handle checkout, orders, logistics, refunds, commissions, or marketplace transactions in version 1. Product purchase and contact actions link out to each artist's own external shop or profile.

## Quick Customization

For homepage wording, navigation labels, theme colors, puzzle colors, and common page copy, start here:

```text
src/lib/customization.ts
```

Short guide:

```text
docs/customization.md
```

## Getting Started

Open Terminal and enter the project folder first:

```bash
cd "/Users/margin/Documents/resinate-with-you"
```

Install dependencies if this is the first time running the project:

```bash
npm install
```

Start the local preview:

```bash
npm run dev
```

Open the local URL shown in Terminal. It is usually:

```text
http://localhost:3000
```

If port `3000` is already in use, Next.js may choose another port such as:

```text
http://localhost:3001
```

Use the exact `Local:` URL printed by Terminal.

If you see an error like `Could not read package.json` or `ENOENT`, it usually means Terminal is not inside the project folder yet. Run the `cd` command above, then run `npm run dev` again.

## Supabase Environment

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ADMIN_NOTIFICATION_EMAIL=
EMAIL_FROM=
ADMIN_REVIEW_TOKEN=
SUPABASE_APPLICATION_PHOTOS_BUCKET=application-photos
SUPABASE_FEATURED_PRODUCT_IMAGES_BUCKET=featured-product-images
SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
SUPABASE_ARTIST_AVATARS_BUCKET=artist-avatars
```

For Vercel production, set:

```text
NEXT_PUBLIC_SITE_URL=https://resinatewithyou.com
EMAIL_FROM=support@resinatewithyou.com
```

`SUPABASE_SERVICE_ROLE_KEY` is used only by server routes for application review, artist account setup, password reset emails, and admin management pages. `NEXT_PUBLIC_SITE_URL` is used inside password setup/reset links; production defaults to `https://resinatewithyou.com` if the variable is missing, but setting it in Vercel is still recommended. `RESEND_API_KEY`, `ADMIN_NOTIFICATION_EMAIL`, and `EMAIL_FROM` enable email notifications. `ADMIN_REVIEW_TOKEN` is optional MVP protection for `/admin/applications`, `/admin/products`, and `/admin/featured-products`.
Create a public Supabase Storage bucket named `application-photos` or set `SUPABASE_APPLICATION_PHOTOS_BUCKET` to the bucket name you prefer. Artist applications require exactly three product photos.
Create public Supabase Storage buckets named `product-images` and `artist-avatars` for artist uploads. `featured-product-images` is kept for older homepage override support, though the current Featured Finds manager uses product images directly.

For step-by-step setup, use:

```text
docs/12-supabase-live-setup-guide.md
```

For the SQL to paste into Supabase SQL Editor, use:

```text
docs/supabase-mvp-schema.sql
```

## Backup

GitHub backs up the code, but not Supabase data. Before risky changes, run:

```bash
npm run backup:supabase
```

Backups are written outside the repo by default:

```text
/Users/margin/Documents/resinate-with-you-db-backups
```

For the full GitHub and Supabase backup workflow, use:

```text
docs/15-github-and-backup.md
```

## Key Docs

- `docs/00-project-overview.md`
- `docs/01-mvp-product-requirements.md`
- `docs/02-database-and-permissions.md`
- `docs/03-artist-application-and-review.md`
- `docs/04-four-week-build-plan.md`
- `docs/05-copy-and-outreach.md`
- `docs/06-brand-name-and-slogans.md`
- `docs/07-account-setup-checklist.md`
- `docs/08-visual-design-direction.md`
- `docs/09-day1-setup-status.md`
- `docs/10-automation-reminder-plan.md`
- `docs/12-supabase-live-setup-guide.md`
- `docs/14-production-domain-email-checklist.md`
- `docs/15-github-and-backup.md`
- `docs/11-project-index.md`

## Current Daily Reminder

Automation ID `4` is attached to the current active conversation.

It runs daily at 09:00 Asia/Shanghai and uses this project folder as the project context:

```text
/Users/margin/Documents/resinate-with-you
```
