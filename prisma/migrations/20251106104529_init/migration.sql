/*
  Warnings:

  - You are about to drop the column `campaignId` on the `Brochure` table. All the data in the column will be lost.
  - You are about to drop the column `campaignId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `campaignId` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `campaignId` on the `RecurringDonation` table. All the data in the column will be lost.
  - You are about to drop the column `campaignId` on the `SuccessStory` table. All the data in the column will be lost.
  - You are about to drop the `CampaignSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CampaignTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DonationCampaign` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Brochure" DROP CONSTRAINT "Brochure_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CampaignSettings" DROP CONSTRAINT "CampaignSettings_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CampaignTranslation" DROP CONSTRAINT "CampaignTranslation_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CartItem" DROP CONSTRAINT "CartItem_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Donation" DROP CONSTRAINT "Donation_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DonationCampaign" DROP CONSTRAINT "DonationCampaign_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RecurringDonation" DROP CONSTRAINT "RecurringDonation_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SuccessStory" DROP CONSTRAINT "SuccessStory_campaignId_fkey";

-- DropIndex
DROP INDEX "public"."CartItem_campaignId_idx";

-- DropIndex
DROP INDEX "public"."Donation_campaignId_idx";

-- DropIndex
DROP INDEX "public"."RecurringDonation_campaignId_idx";

-- AlterTable
ALTER TABLE "Brochure" DROP COLUMN "campaignId";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "campaignId",
ADD COLUMN     "projectId" INTEGER;

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "campaignId",
ADD COLUMN     "projectId" INTEGER;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "donorCount" INTEGER DEFAULT 0,
ALTER COLUMN "beneficiaryCount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "RecurringDonation" DROP COLUMN "campaignId",
ADD COLUMN     "projectId" INTEGER;

-- AlterTable
ALTER TABLE "SuccessStory" DROP COLUMN "campaignId";

-- DropTable
DROP TABLE "public"."CampaignSettings";

-- DropTable
DROP TABLE "public"."CampaignTranslation";

-- DropTable
DROP TABLE "public"."DonationCampaign";

-- CreateTable
CREATE TABLE "ProjectSettings" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "presetAmounts" JSONB,
    "minAmount" DOUBLE PRECISION,
    "maxAmount" DOUBLE PRECISION,
    "allowRepeat" BOOLEAN NOT NULL DEFAULT true,
    "minRepeatCount" INTEGER DEFAULT 2,
    "maxRepeatCount" INTEGER DEFAULT 18,
    "allowOneTime" BOOLEAN NOT NULL DEFAULT true,
    "allowRecurring" BOOLEAN NOT NULL DEFAULT true,
    "allowedFrequencies" JSONB,
    "allowDedication" BOOLEAN NOT NULL DEFAULT false,
    "allowAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "requireMessage" BOOLEAN NOT NULL DEFAULT false,
    "isSacrifice" BOOLEAN NOT NULL DEFAULT false,
    "sacrificeConfig" JSONB,
    "showProgress" BOOLEAN NOT NULL DEFAULT true,
    "showDonorCount" BOOLEAN NOT NULL DEFAULT true,
    "showBeneficiaries" BOOLEAN NOT NULL DEFAULT true,
    "impactMetrics" JSONB,
    "successStories" JSONB,
    "customCss" TEXT,
    "customJs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityArea" (
    "id" SERIAL NOT NULL,
    "icon" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityAreaTranslation" (
    "id" SERIAL NOT NULL,
    "activityAreaId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityAreaTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSettings_projectId_key" ON "ProjectSettings"("projectId");

-- CreateIndex
CREATE INDEX "ActivityArea_isActive_idx" ON "ActivityArea"("isActive");

-- CreateIndex
CREATE INDEX "ActivityArea_displayOrder_idx" ON "ActivityArea"("displayOrder");

-- CreateIndex
CREATE INDEX "ActivityAreaTranslation_language_idx" ON "ActivityAreaTranslation"("language");

-- CreateIndex
CREATE INDEX "ActivityAreaTranslation_slug_idx" ON "ActivityAreaTranslation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityAreaTranslation_activityAreaId_language_key" ON "ActivityAreaTranslation"("activityAreaId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityAreaTranslation_language_slug_key" ON "ActivityAreaTranslation"("language", "slug");

-- CreateIndex
CREATE INDEX "CartItem_projectId_idx" ON "CartItem"("projectId");

-- CreateIndex
CREATE INDEX "Donation_projectId_idx" ON "Donation"("projectId");

-- CreateIndex
CREATE INDEX "RecurringDonation_projectId_idx" ON "RecurringDonation"("projectId");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringDonation" ADD CONSTRAINT "RecurringDonation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSettings" ADD CONSTRAINT "ProjectSettings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityAreaTranslation" ADD CONSTRAINT "ActivityAreaTranslation_activityAreaId_fkey" FOREIGN KEY ("activityAreaId") REFERENCES "ActivityArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
