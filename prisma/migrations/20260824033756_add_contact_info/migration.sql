-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "contactVisible" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "language" SET DEFAULT 'EN';
