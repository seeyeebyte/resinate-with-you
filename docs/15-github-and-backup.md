# GitHub And Backup

Use this note whenever the project is ready for another safety checkpoint.

## What GitHub Backs Up

GitHub backs up the website code, docs, schema file, and project history.

It does not back up:

- Supabase table rows
- Supabase Auth users
- uploaded Storage files
- `.env.local` secrets
- Vercel environment variables

The current GitHub remote is:

```text
https://github.com/seeyeebyte/resinate-with-you.git
```

Supabase may still show `No repository connected`. That means Supabase itself has not been connected to a GitHub repo for database branching or migration workflows. It is optional for this MVP as long as the project code is pushed to GitHub and the schema file is kept in `docs/supabase-mvp-schema.sql`.

## Code Backup

Before a big change:

```bash
git status
npm run lint
npm run build
git add -A
git commit -m "Describe the checkpoint"
git push origin main
```

Never commit `.env.local`.

## Supabase Data Backup

Run:

```bash
npm run backup:supabase
```

The backup command reads `.env.local`, uses `SUPABASE_SERVICE_ROLE_KEY`, and writes a JSON file outside the repo by default:

```text
/Users/margin/Documents/resinate-with-you-db-backups
```

This backup includes:

- applications
- artists
- profiles
- products
- featured_products
- clicks
- Supabase Auth user records

It does not include Auth passwords. Supabase does not expose user passwords.

To write backups somewhere else:

```bash
SUPABASE_BACKUP_DIR="/path/to/backup-folder" npm run backup:supabase
```

Do not put backup files in GitHub. They can include private emails, applications, product data, and user metadata.

## Recommended Rhythm

For MVP testing:

- Push to GitHub after every meaningful product change.
- Run `npm run backup:supabase` before editing schema, approving real artists, or changing Auth/account flows.
- Keep at least one recent backup on the computer and one copy outside the project folder.

For production:

- Use a paid Supabase plan or another official backup workflow for automated database backups.
- Keep this local backup command as a quick manual checkpoint before risky changes.
