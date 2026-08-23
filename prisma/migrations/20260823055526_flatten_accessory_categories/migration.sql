-- Promote the 5 accessory sub-categories to top-level GearCategory values,
-- migrating existing ACCESSORY rows using their subcategory before it's
-- dropped. Done as one superset-enum -> reassign -> narrow-enum sequence
-- since Postgres can't add-and-use or drop an enum value in one step.
BEGIN;

CREATE TYPE "GearCategory_step1" AS ENUM ('SHOE', 'WATCH', 'APPAREL', 'ACCESSORY', 'NUTRITION', 'HEADPHONES', 'RUNNING_BELT', 'HYDRATION_VEST', 'SUNGLASSES', 'HEADLAMP', 'GLOVES');
ALTER TABLE "Gear" ALTER COLUMN "category" TYPE "GearCategory_step1" USING ("category"::text::"GearCategory_step1");
DROP TYPE "GearCategory";

UPDATE "Gear" SET "category" = 'RUNNING_BELT' WHERE "category" = 'ACCESSORY' AND "subcategory" = 'Running Belt';
UPDATE "Gear" SET "category" = 'HYDRATION_VEST' WHERE "category" = 'ACCESSORY' AND "subcategory" = 'Hydration Vest';
UPDATE "Gear" SET "category" = 'SUNGLASSES' WHERE "category" = 'ACCESSORY' AND "subcategory" = 'Sunglasses';
UPDATE "Gear" SET "category" = 'HEADLAMP' WHERE "category" = 'ACCESSORY' AND "subcategory" = 'Headlamp';
UPDATE "Gear" SET "category" = 'GLOVES' WHERE "category" = 'ACCESSORY' AND "subcategory" = 'Gloves';

ALTER TABLE "Gear" DROP COLUMN "subcategory";

CREATE TYPE "GearCategory" AS ENUM ('SHOE', 'WATCH', 'APPAREL', 'NUTRITION', 'HEADPHONES', 'RUNNING_BELT', 'HYDRATION_VEST', 'SUNGLASSES', 'HEADLAMP', 'GLOVES');
ALTER TABLE "Gear" ALTER COLUMN "category" TYPE "GearCategory" USING ("category"::text::"GearCategory");
DROP TYPE "GearCategory_step1";

COMMIT;
