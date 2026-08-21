-- AlterTable: add new columns nullable first so we can backfill existing rows
ALTER TABLE "User" ADD COLUMN "displayId" TEXT;
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;

-- Backfill from the old displayName/username columns
UPDATE "User" SET
  "displayId" = "username",
  "firstName" = COALESCE(NULLIF(split_part("displayName", ' ', 1), ''), "username"),
  "lastName"  = NULLIF(split_part("displayName", ' ', 2), '');

-- Enforce NOT NULL now that every row has a value
ALTER TABLE "User" ALTER COLUMN "displayId" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "firstName" SET NOT NULL;

CREATE UNIQUE INDEX "User_displayId_key" ON "User"("displayId");

ALTER TABLE "User" DROP COLUMN "displayName";
