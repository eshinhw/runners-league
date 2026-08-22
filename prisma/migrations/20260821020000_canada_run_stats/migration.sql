-- Clear existing Korean-region values before the enum swap (values won't
-- exist in the new Canadian-province enum, so the cast below would fail).
-- Note: LeaderboardWinner was dropped by the marathon_majors migration
-- before this one runs, so it's intentionally not touched here.
UPDATE "User" SET "region" = NULL;

-- AlterEnum
BEGIN;
CREATE TYPE "Region_new" AS ENUM ('ONTARIO', 'QUEBEC', 'BRITISH_COLUMBIA', 'ALBERTA', 'MANITOBA', 'SASKATCHEWAN', 'NOVA_SCOTIA', 'NEW_BRUNSWICK', 'NEWFOUNDLAND_AND_LABRADOR', 'PRINCE_EDWARD_ISLAND', 'YUKON', 'NORTHWEST_TERRITORIES', 'NUNAVUT', 'OTHER');
ALTER TABLE "User" ALTER COLUMN "region" TYPE "Region_new" USING ("region"::text::"Region_new");
ALTER TYPE "Region" RENAME TO "Region_old";
ALTER TYPE "Region_new" RENAME TO "Region";
DROP TYPE "Region_old";
COMMIT;

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "avgCadenceSpm" INTEGER,
ADD COLUMN     "avgHeartRateBpm" INTEGER;
