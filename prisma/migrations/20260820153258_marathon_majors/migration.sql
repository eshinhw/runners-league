-- CreateEnum
CREATE TYPE "MarathonMajor" AS ENUM ('TOKYO', 'BOSTON', 'LONDON', 'BERLIN', 'CHICAGO', 'NEW_YORK', 'SYDNEY');

-- DropForeignKey
ALTER TABLE "LeaderboardWinner" DROP CONSTRAINT "LeaderboardWinner_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChallengeParticipant" DROP CONSTRAINT "ChallengeParticipant_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "ChallengeParticipant" DROP CONSTRAINT "ChallengeParticipant_userId_fkey";

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "major" "MarathonMajor";

-- DropTable
DROP TABLE "LeaderboardWinner";

-- DropTable
DROP TABLE "Challenge";

-- DropTable
DROP TABLE "ChallengeParticipant";

-- DropEnum
DROP TYPE "PeriodType";

-- CreateIndex
CREATE INDEX "Activity_major_idx" ON "Activity"("major");

