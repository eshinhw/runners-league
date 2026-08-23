-- AlterEnum
BEGIN;
CREATE TYPE "GearCategory_new" AS ENUM ('SHOE', 'WATCH', 'APPAREL', 'ACCESSORY', 'NUTRITION', 'HEADPHONES');
ALTER TABLE "Gear" ALTER COLUMN "category" TYPE "GearCategory_new" USING ("category"::text::"GearCategory_new");
ALTER TYPE "GearCategory" RENAME TO "GearCategory_old";
ALTER TYPE "GearCategory_new" RENAME TO "GearCategory";
DROP TYPE "GearCategory_old";
COMMIT;
