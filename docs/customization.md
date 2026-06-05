# Customization Guide

Most visual and homepage edits should start in:

`src/lib/customization.ts`

## Common Edits

### Site Name And Navigation

Edit:

- `siteIdentity.name`
- `siteIdentity.tagline`
- `siteIdentity.description`
- `navigationContent.primary`
- `navigationContent.footer`
- `headerContent.loginLabel`
- `headerContent.primaryCtaLabel`

### Homepage Text

Edit:

- `homepageContent.hero`
- `homepageContent.featuredFinds`
- `homepageContent.directoryPreview`
- `homepageContent.processCards`
- `homepageContent.applyBand`

### Show Or Hide Homepage Sections

Edit `homepageContent.sections`:

```ts
sections: {
  hero: true,
  featuredFinds: true,
  directoryPreview: true,
  processCards: true,
  applyBand: true,
}
```

Set a section to `false` to hide it.

### Theme Colors

Edit `themeConfig.colors`.

Main colors:

- `background`: page background
- `ink`: main text and dark buttons
- `muted`: body text
- `line`: borders
- `blue`, `lavender`, `sage`, `mint`: soft theme colors

### Puzzle Colors

Edit `themeConfig.puzzle`.

- `cloverLogoTones`: logo piece colors
- `artistWallTones`: artist puzzle wall colors
- `productBadgeTones`: product price badge colors
- `artistCardTones`: artist card icon colors
- `chipTones`: tag/chip colors

### About And Apply Pages

Edit:

- `aboutPageContent`
- `applyPageContent`

## Still Edited Elsewhere

Product and artist data still come from the site data/admin flow, not this customization file.

Fonts are currently set in `src/app/layout.tsx`. If the site should avoid Google Fonts network fetches during build, switch them to local font files later.
