-- AlterTable
ALTER TABLE "CampaignSettings" ADD COLUMN     "isSacrifice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sacrificeConfig" JSONB;

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "isSacrifice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sacrificeType" TEXT,
ADD COLUMN     "shareCount" INTEGER DEFAULT 1,
ADD COLUMN     "sharePrice" DOUBLE PRECISION;
