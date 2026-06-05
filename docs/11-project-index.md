# Project Index

Date updated: 2026-06-05

## Official Project Folder

```text
/Users/margin/Documents/滴胶作者网站
```

Use this folder as the main project entry.

## Current Brand

Brand name:

```text
Resinate With You
```

Main slogan:

```text
Discover resin artists. Create pieces together.
```

## Current Status

The project now contains the first-round Next.js MVP plus live Supabase wiring:

- Homepage
- Favorite Finds This Week
- Artist Directory with live approved data and mock fallback
- Artist detail pages
- Product detail pages
- Product Directory page with live approved data and mock fallback
- Artist application page
- Stable country dropdown and province/state text input
- Artist application duplicate-email detection
- Artist login entry and dashboard shell
- Server-routed artist application form
- Artist application review MVP
- Admin application review page
- Admin Favorite Finds manager
- Approved-artist product publishing direction
- Artist application status lookup page
- Resend-ready email notification helpers
- Migrated project planning docs
- Project materials folders

## Progress Update Rule

After each meaningful completed change, update this project index or the related feature doc so the project status stays current. Do not wait until a full build phase is finished.

## Progress Table

| Area | Status | Notes |
| --- | --- | --- |
| Static public site | Done | Homepage, Favorite Finds, Product Directory, Artist Directory, artist detail, and product detail pages exist. |
| Public directory database reads | Live artist display tested | Public artists/products read approved Supabase data, with mock fallback while live data is empty. An approved artist has appeared publicly after review. |
| Artist application form | Streamlined and mobile-safe | Form submits through `/api/applications`, supports separate contact/link platform and actual account/link, stable country dropdown, typed province/state, required contact name, Instagram URL validation, stricter email format validation, three separate required review-photo inputs, USD price guidance, English bio guidance, and a 500-character short bio. Text fields auto-save locally. Success now appears in a centered confirmation dialog, upload and validation errors stay with the form, and the first-load button state now explains that the form is loading instead of looking broken. |
| Duplicate application control | Live rule confirmed | The form checks email after input, blocks duplicate emails before image upload, and Supabase now has the unique lower-case email index confirmed. |
| Application review flow | Live approve tested | `/admin/applications` can review applications, save notes, approve, request more info, or reject. A submitted test application has been approved live. |
| Artist status lookup | Live approved-status tested | `/artist/application-status` lets applicants check status by email. The approved test application now shows the updated status. |
| Favorite Finds admin | Clarified | `/admin/featured-products` controls which approved products appear on the homepage and their order. Admins choose products from thumbnail cards, and public homepage cards use the product's own first image so Featured Finds, product directory, and product detail start from the same photo. |
| Supabase database setup | MVP flow tested | Tables, buckets, env values, submission, image upload, duplicate-email index, duplicate-email blocking, 15-product limit, live approval, public artist display, approved status lookup, product image bucket, and artist avatar bucket are documented. |
| Email notifications | Code done, not live-critical | Admin and applicant email helpers are wired for Resend. Needs `RESEND_API_KEY`, `EMAIL_FROM`, and `ADMIN_NOTIFICATION_EMAIL` before live email sending. |
| Artist login/dashboard | Professional workspace sections added | Header links to `/artist/login`; Supabase email/password sign-in routes artists to `/artist/dashboard`, now split into Profile, Products, and Account sections. Artists can edit avatar, brand/contact names, independent public contact email, searchable country/province, Instagram, website, optional contact/shop platform and account/link, categories, products, and account session actions. |
| Product publishing | Manageable by artist | Approved artists can publish products directly from `/artist/products/new`. Product upload is limited to 1-5 images, 2 MB each. Product detail pages now support multiple images with a smaller gallery layout. Dashboard now shows a compact product list with Edit, Hide/Show, and Delete actions; edit mode supports product text fields and image add/delete. |

Latest validation:

```text
npm run lint: passed
npx tsc --noEmit: passed
npm run build: blocked locally because Google Fonts could not be reached; no code compilation error was reported before the network failure
```

Latest UI changes:

```text
Desktop homepage uses the interactive 3D puzzle model again; phone and tablet layouts use the lightweight static image and do not initialize Three.js.
The current mobile fallback image is `public/assets/resin-collection.png` at 1536 x 1024. A 1600 x 1200 replacement is recommended for the current 4:3 mobile crop.
Desktop 3D loading now uses the stable `/models/lovepuzzle.glb` asset path and only reports an error after a real loader failure; the previous fixed 15-second false-failure timer was removed.
The artist application intro is shorter, the large review-rules card is replaced by one concise line, and mobile spacing reaches the form sooner.
Application review photos now use three separate required upload slots with visible native file controls, selected-file confirmation, image previews, per-photo format/size errors, and local HEIC/HEIF-to-JPEG preparation where the browser supports it. This avoids silent iPhone photo-picker failures and keeps missing photos from clearing completed text fields.
Successful React and native application submissions now open the same centered `Application received` confirmation dialog.
Product detail page now uses a smaller multi-image gallery with thumbnails.
Product uploads now allow 1-5 images, max 2 MB each.
When signed in, the header logo and right-side actions link to artist dashboard/product publishing.
Artist dashboard now lets approved artists upload a public avatar.
Featured Finds admin now explains homepage-only image overrides and can clear them.
Product detail price now labels `Price` and normalizes plain numeric prices to USD display.
Product directory uses `Style` instead of `Tag`, and style filters now read actual product style tags.
Artist dashboard now lets artists edit public profile details and manage existing products.
Artist dashboard has been reorganized into Profile, Products, and Account sections.
Artist product overview now defaults to compact rows, with product editing and image management inside an expandable edit mode. Product image deletion is now a direct per-image button with a confirmation window.
Artist profile editing now follows the application form rules for searchable locations, Instagram URL validation, product category choices, and separate contact platform/account fields.
Featured Finds now uses the product's first product image for homepage display and ignores old homepage override images, matching product directory and product detail defaults.
Featured Finds admin no longer allows separate homepage image uploads; admins choose products from thumbnail cards only.
Artist puzzle wall labels and popovers now use the uploaded artist avatar when available, with initials only as fallback.
Artist profile editing now supports an independent public contact email, while login email remains separate. Contact/shop platform can be cleared back to no selection.
Mobile browsing now hides the heavy homepage 3D model, shows a lightweight artist card list instead of the full SVG puzzle wall, uses touch-friendly clickable country/province suggestion lists, manual typing fields, and an explicit typed-value confirmation button instead of iOS native selects, bundles country and province/state location suggestions locally so mobile selection no longer waits on location API calls, and adds explicit Apply/Clear controls to directory filters.
Country and province/state fields now use one controlled search picker across desktop and mobile, so typed text, tapped suggestions, saved form values, and province/state suggestions stay in sync on iPhone Safari.
Mobile application/profile location fields now use the simplest reliable structure: country/region is a native select menu, province/state is a plain text input, and product category choices use visible checkbox controls for more reliable iPhone tapping.
Application submission now uses explicit in-page validation instead of relying on mobile browser validation, so invalid email/link/photo/authorization errors show on the form and scroll into view. Application, status lookup, and artist profile routes now share the same email validation rule.
Mobile application reliability now includes local text-draft recovery, visible upload/submission progress, stricter email format checks, connection/timeout errors, and a reminder that selected photo files must be reselected after a browser refresh. The form now blocks submission until the client form logic is ready and validates all three photo slots before sending a request, so a missing photo cannot refresh the page or clear completed fields. Development and production build caches use separate directories to prevent build commands from overwriting an active dev server's client chunks.
Mobile application first-load behavior now uses `Loading form...` with a short explanation and a delayed refresh warning if the client form logic does not finish loading.
Native application submissions now return relative `303` redirects, so phones that open the development site through a LAN address stay on that address instead of being redirected to the server-only `0.0.0.0` host.
Artist login now posts to the local same-origin `/api/artist/login` endpoint before storing the Supabase session, avoiding unreliable direct phone-to-Supabase login requests on the LAN development site. Mobile login also reports invalid email, connection failure, and timeout states explicitly.

Working rule: after each stable small block is completed, run the relevant checks and create a local git checkpoint before starting the next block. This keeps mobile fixes reversible and easier to compare.
```

## Main Docs

Read these first:

```text
README.md
docs/00-project-overview.md
docs/01-mvp-product-requirements.md
docs/02-database-and-permissions.md
docs/03-artist-application-and-review.md
docs/04-four-week-build-plan.md
docs/12-supabase-live-setup-guide.md
docs/supabase-mvp-schema.sql
```

Brand and visual work:

```text
docs/06-brand-name-and-slogans.md
docs/08-visual-design-direction.md
project-materials/Brand
```

## Local Admin Entry

Local admin pages currently use the MVP URL token guard. Add `?token=resinate-admin-2026-private` to the admin URL:

```text
http://localhost:3000/admin/applications?token=resinate-admin-2026-private
http://localhost:3000/admin/featured-products?token=resinate-admin-2026-private
```

This comes from `ADMIN_REVIEW_TOKEN` in `.env.local`. Before launch, replace this temporary URL-token guard with a real admin login.

## Automation Reminder

Automation ID:

```text
4
```

Current behavior:

```text
Heartbeat reminder attached to the current active Codex conversation.
Daily at 09:00 Asia/Shanghai.
Day 1 is complete.
Brand has been locked on Day 2.
```

The reminder cannot live inside the project folder as a chat heartbeat, but this folder stores the source-of-truth plan and status.

## Next Work

Recommended order from here:

1. Run the latest storage SQL so `product-images` exists in Supabase.
2. Use a signed-in approved artist to test `/artist/products/new`.
3. Confirm the product publishing form saves products as `approved` in Supabase.
4. Confirm the product appears in `/products`, the artist detail page, and the product detail page.
5. Improve public product/artist display quality with real test content.
6. Add simple admin product hiding if needed for moderation.
7. Configure Resend later if live email notifications are needed before launch.
8. Prepare a small pre-launch checklist for mobile, copy, images, and empty states.

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```
