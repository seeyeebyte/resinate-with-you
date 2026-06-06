import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const PROJECT_ROOT = process.cwd();
const DEFAULT_TABLES = [
  "applications",
  "artists",
  "profiles",
  "products",
  "featured_products",
  "clicks",
];

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ${filePath}. Create it from .env.example first.`);
  }

  const env = {};
  const text = fs.readFileSync(filePath, "utf8");

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function backupDirectory() {
  if (process.env.SUPABASE_BACKUP_DIR) {
    return path.resolve(process.env.SUPABASE_BACKUP_DIR);
  }

  return path.resolve(PROJECT_ROOT, "..", "resinate-with-you-db-backups");
}

async function listAuthUsers(supabase) {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      return { users, error: error.message };
    }

    const batch = data?.users ?? [];
    users.push(
      ...batch.map((user) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_sign_in_at: user.last_sign_in_at,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
      })),
    );

    if (batch.length < 1000) break;
    page += 1;
  }

  return { users, error: null };
}

async function main() {
  const env = {
    ...readEnvFile(path.join(PROJECT_ROOT, ".env.local")),
    ...process.env,
  };

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const backup = {
    created_at: new Date().toISOString(),
    project_url: url,
    notes: [
      "Local Supabase backup for Resinate With You.",
      "Do not commit backup files or service-role keys to GitHub.",
      "Supabase Auth passwords are never exported.",
    ],
    tables: {},
    auth_users: { users: [], error: null },
  };

  for (const table of DEFAULT_TABLES) {
    const { data, error } = await supabase.from(table).select("*");
    backup.tables[table] = error
      ? { rows: [], error: error.message }
      : { rows: data ?? [], error: null };
  }

  backup.auth_users = await listAuthUsers(supabase);

  const outDir = backupDirectory();
  fs.mkdirSync(outDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = path.join(outDir, `${stamp}-supabase-backup.json`);
  fs.writeFileSync(outPath, JSON.stringify(backup, null, 2));

  const tableCounts = Object.fromEntries(
    Object.entries(backup.tables).map(([table, value]) => [
      table,
      value.rows.length,
    ]),
  );
  const tableErrors = Object.fromEntries(
    Object.entries(backup.tables)
      .filter(([, value]) => value.error)
      .map(([table, value]) => [table, value.error]),
  );

  console.log(JSON.stringify({
    backup_file: outPath,
    table_counts: tableCounts,
    table_errors: tableErrors,
    auth_user_count: backup.auth_users.users.length,
    auth_error: backup.auth_users.error,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
