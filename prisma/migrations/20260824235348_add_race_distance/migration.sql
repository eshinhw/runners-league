-- CreateEnum
CREATE TYPE "RaceDistance" AS ENUM ('FIVE_K', 'TEN_K', 'HALF', 'FULL', 'ULTRA');

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "raceDistance" "RaceDistance";

-- Backfill: every existing Major result predates the distance picker and
-- was always logged as a full marathon (see MARATHON_DISTANCE_M in
-- src/app/(main)/settings/runs/actions.ts before this migration).
UPDATE "Activity" SET "raceDistance" = 'FULL' WHERE "major" IS NOT NULL;
