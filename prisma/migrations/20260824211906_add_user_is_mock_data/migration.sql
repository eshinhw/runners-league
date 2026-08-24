-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isMockData" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "User_isMockData_idx" ON "User"("isMockData");

