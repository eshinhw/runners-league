-- CreateEnum
CREATE TYPE "UnitSystem" AS ENUM ('METRIC', 'IMPERIAL');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('KO', 'EN');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "birthYear",
DROP COLUMN "location",
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "heightCm" INTEGER,
ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'KO',
ADD COLUMN     "unitSystem" "UnitSystem" NOT NULL DEFAULT 'METRIC',
ADD COLUMN     "weightKg" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "location" TEXT,
ADD COLUMN     "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

