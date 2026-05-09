// One-time migration runner invoked by `npm run vercel-build`.
// Drops the legacy Profile.gender column on the Vercel Postgres database.
// No-ops on every other environment (no URL, sqlite, etc.) so local
// builds and preview deploys without the integration wired up still work.
//
// Once the column has been dropped on every deployment that matters,
// remove this script, prisma/sql/drop_profile_gender.sql, and the
// `node prisma/sql/run-migration.mjs` step from package.json.

import { execSync } from "node:child_process";

const url = process.env.DATABASE_URL ?? "";

if (!/^postgres(?:ql)?:\/\//.test(url)) {
  console.log(`[migration] Skipping: DATABASE_URL is not Postgres (${url ? "set but other protocol" : "unset"}).`);
  process.exit(0);
}

console.log("[migration] Running drop_profile_gender.sql against Postgres…");
execSync(
  "npx --no-install prisma db execute --file prisma/sql/drop_profile_gender.sql --schema prisma/schema.prisma",
  { stdio: "inherit" },
);
console.log("[migration] Done.");
