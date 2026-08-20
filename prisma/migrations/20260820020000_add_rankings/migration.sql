-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('SEOUL', 'BUSAN', 'INCHEON', 'DAEGU', 'DAEJEON', 'GWANGJU', 'ULSAN', 'SEJONG', 'GYEONGGI', 'GANGWON', 'CHUNGBUK', 'CHUNGNAM', 'JEONBUK', 'JEONNAM', 'GYEONGBUK', 'GYEONGNAM', 'JEJU', 'OTHER');

-- CreateEnum
CREATE TYPE "RunType" AS ENUM ('SPEED', 'TEMPO', 'LSD', 'EASY', 'RACE');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthYear" INTEGER,
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'UNSPECIFIED',
ADD COLUMN     "region" "Region";

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "runType" "RunType";

-- CreateTable
CREATE TABLE "LeaderboardWinner" (
    "id" TEXT NOT NULL,
    "periodType" "PeriodType" NOT NULL,
    "periodKey" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "gender" "Gender",
    "region" "Region",
    "runType" "RunType",
    "ageBand" TEXT,
    "rank" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "totalDistanceM" INTEGER NOT NULL,
    "runCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardWinner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeaderboardWinner_periodType_periodKey_idx" ON "LeaderboardWinner"("periodType", "periodKey");

-- CreateIndex
CREATE INDEX "LeaderboardWinner_userId_idx" ON "LeaderboardWinner"("userId");

-- CreateIndex
CREATE INDEX "User_gender_idx" ON "User"("gender");

-- CreateIndex
CREATE INDEX "User_region_idx" ON "User"("region");

-- CreateIndex
CREATE INDEX "Activity_runType_startedAt_idx" ON "Activity"("runType", "startedAt");

-- AddForeignKey
ALTER TABLE "LeaderboardWinner" ADD CONSTRAINT "LeaderboardWinner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

