-- DropForeignKey
ALTER TABLE "DeviceToken" DROP CONSTRAINT "DeviceToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalAccount" DROP CONSTRAINT "ExternalAccount_userId_fkey";

-- DropIndex
DROP INDEX "Activity_source_externalId_key";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "externalId",
DROP COLUMN "source";

-- DropTable
DROP TABLE "DeviceToken";

-- DropTable
DROP TABLE "ExternalAccount";

-- DropEnum
DROP TYPE "ActivitySource";

-- DropEnum
DROP TYPE "ExternalProvider";

