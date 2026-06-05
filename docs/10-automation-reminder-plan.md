# Daily Build Reminder Automation

Automation ID: `4`

Current type:

```text
heartbeat
```

Current schedule:

```text
Daily at 09:00 Asia/Shanghai
Day 1 is complete; 27 reminders remain
```

Current behavior:

```text
The reminder is attached to the current active conversation thread.
It sends one daily task reminder for the 4-week DIY MVP build plan.
```

Important limitation:

```text
This reminder is thread-bound. It cannot be moved directly into the project workspace while keeping the exact same chat reminder behavior.
```

Project-side source of truth:

```text
README.md
docs/00-project-overview.md
docs/04-four-week-build-plan.md
docs/09-day1-setup-status.md
docs/10-automation-reminder-plan.md
docs/11-project-index.md
```

Official project folder:

```text
/Users/margin/Documents/Codex/resin-artist-platform-mvp
```

## Reminder Plan

The automation follows the 28-day build schedule:

```text
Day 1: Prepare accounts and tools
Day 2: Confirm working brand direction, site sections, and core data fields
Day 3: Create the Next.js project
Day 4: Structure the homepage
Day 5: Build Favorite Finds
Day 6: Build fake-data Artist Directory cards and filters
Day 7: Weekly review and adjustments

Day 8: Create Supabase project
Day 9: Create applications, artists, products, and clicks tables
Day 10: Connect frontend reads to database
Day 11: Build artist application form
Day 12: Save applications and statuses
Day 13: Load directory filters from database
Day 14: Weekly review

Day 15: Add Supabase Auth
Day 16: Build artist login and signup
Day 17: Build artist profile editing
Day 18: Build product creation form
Day 19: Add image upload
Day 20: Enforce max 15 products per artist
Day 21: Weekly review

Day 22: Build admin dashboard entry
Day 23: Build artist application review
Day 24: Build product review
Day 25: Build Favorite Finds management
Day 26: Add click tracking
Day 27: Mobile and copy QA
Day 28: Deploy to Vercel and prepare artist outreach
```

## Current Status

```text
Day 1: completed locally
Day 2: brand locked as Resinate With You
```

Next reminder:

```text
2026-05-28 09:00 Asia/Shanghai
Day 2/Day 3 bridge: confirm remaining data fields and prepare Supabase setup
```

## Current Automation Update

On 2026-05-27, Automation ID `4` was updated so future reminders continue in the current active conversation instead of the older mixed planning conversation.

The reminder now uses this project folder as the main project context.
