# Project Overview

Working Chinese name:

```text
滴胶作者导流平台 MVP
```

Working English name:

```text
Resinate With You
```

## One-Sentence Summary

This is a creator discovery and co-creation platform for handmade resin pieces and independent resin artists. The first version focuses on showcasing work, filtering artists, reviewing applications, letting approved artists upload products, and sending visitors to each artist's external shop or contact link.

## Product Positioning

The platform helps consumers discover selected handmade resin products and independent resin artists in one place, then connect directly with artists for purchases, conversations, or custom work.

Many resin artists currently sell through scattered channels such as Instagram, Shopify, Etsy, and personal websites. Consumers have no easy central place to browse these artists. This platform collects high-quality resin artists and their work, helping consumers discover them while sending traffic back to the artists' own stores and social channels.

The platform is not a checkout marketplace in version 1. Product purchase and contact actions link out to the artist's Shopify, Etsy, Instagram, independent site, or another external destination.

## Core Logic

The business model starts with discovery and traffic referral, not transaction handling.

This keeps the MVP simpler and makes artist onboarding easier, because the platform is not taking over orders. It helps artists gain visibility and external traffic.

## MVP Scope

### Public Frontend

- Homepage
- Favorite Finds This Week recommendation module
- Artist Directory
- Artist filtering by category, location, and custom availability
- Artist detail page
- Product detail page
- External purchase or contact link
- Artist application page

### Artist Features

- Submit artist application
- Create account after approval
- Log in to artist dashboard
- Edit artist profile
- Upload products
- Upload up to 15 products per artist
- Publish products directly after artist approval
- View product status: live or hidden

### Admin Features

- Review artist applications
- Hide products if needed
- Edit or hide artist profiles
- Edit or hide products
- Set homepage featured products
- View external link click counts

## Explicitly Out of Scope For Version 1

- On-site payments
- Order management
- Shipping management
- Refunds and after-sales
- Commission splits
- Shopify one-click import
- Etsy one-click import
- Mobile app
- Complex recommendation algorithm

## Artist Limit

Each artist can upload up to 15 products.

This keeps quality controlled and prevents the platform from turning into a cluttered product shelf.

## Review System

Artist applications require review.

Uploaded products also require review. Products are only shown on the public frontend after approval.

## Visual Direction

The visual style should feel:

- Simple
- Refined
- Clean
- Lightly animated
- Curated

It should not feel like Taobao, Amazon, or an empty art gallery.

## Core Visual Concept

Main concept:

```text
puzzle pieces / mosaic / pieces
```

Meaning:

Each artist and each product is a unique piece. The platform collects resin works scattered across different websites and social platforms, making it easier for consumers to discover a fuller world of resin creators.

Useful UI modules:

- Favorite Finds This Week: large product recommendations
- Directory: search, category filter, location filter, artist cards
- Horizontal preview rails: many product or artist pieces shown as a curated mosaic

## Naming Status

The current working brand is:

```text
Resinate With You
```

Main slogan:

```text
Discover resin artists. Create pieces together.
```

The name should be treated as the MVP working brand. Folder and repository names can stay neutral as `resin-artist-platform-mvp`.

Before public launch, check domains, social handles, and trademark databases because similar resin-related names and phrases already exist.

## Recommended Tech Stack

Recommended for solo building with AI support:

- Next.js
- Tailwind CSS
- Supabase
- Vercel
- GitHub
- Resend

Primary uses:

- Next.js: website framework
- Tailwind CSS: styling
- Supabase Auth: artist and admin login
- Supabase Database: artists, products, applications, and click data
- Supabase Storage: image uploads
- Vercel: deployment
- GitHub: code repository
- Resend: email notifications

## Database Plan

Core tables:

- profiles
- applications
- artists
- products
- product_images
- clicks
- featured_products

Main rules:

- Artist applications enter `applications`.
- Approved applications create `artists`.
- Artist uploads create `products`.
- Product images are stored in `product_images`.
- External link clicks are recorded in `clicks`.
- Homepage recommended products are controlled by `featured_products`.

## Four-Week Build Plan

### Week 1

- Register tools
- Set up project
- Finish static homepage
- Finish Favorite Finds
- Finish fake-data Artist Directory filtering

### Week 2

- Create Supabase project
- Create database tables
- Connect real data
- Finish artist application form
- Save application data to database

### Week 3

- Add login system
- Build artist dashboard
- Let artists edit profiles
- Let artists upload products
- Enforce the 15-product artist limit

### Week 4

- Build admin dashboard
- Review artists
- Hide products if needed
- Set homepage recommendations
- Track external clicks
- Check mobile layout
- Deploy to Vercel
- Prepare artist invitations

## Current Project Folder

```text
/Users/margin/Documents/Codex/2026-05-26/ins-shopify-app
```

## Current Files

Already prepared:

- Static demo homepage
- Product recommendation module
- Filterable artist directory demo
- Artist application modal demo
- Resin product visual
- Early planning docs
- Database design doc
- Artist application and review doc
- Four-week build plan
- Website copy and outreach messages
- Brand naming and slogan doc
- Visual design direction doc
- Account setup checklist

Document list:

- `docs/01-mvp-product-requirements.md`
- `docs/02-database-and-permissions.md`
- `docs/03-artist-application-and-review.md`
- `docs/04-four-week-build-plan.md`
- `docs/05-copy-and-outreach.md`
- `docs/06-brand-name-and-slogans.md`
- `docs/07-account-setup-checklist.md`
- `docs/08-visual-design-direction.md`

## Recommended Next Steps

1. Finalize the brand name.
2. Check domain and social account availability.
3. Register GitHub, Vercel, Supabase, and Resend.
4. Convert the static demo into a Next.js project.
5. Build the public frontend and artist application form first.
