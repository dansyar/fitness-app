-- One-time schema cleanup applied during Vercel builds. Idempotent — once
-- the column is gone the IF EXISTS clause makes subsequent runs a no-op.
-- Remove this file (and the `prisma db execute` step from the vercel-build
-- script in package.json) once you're satisfied the column has been dropped.
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "gender";
