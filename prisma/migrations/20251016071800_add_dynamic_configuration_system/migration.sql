-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "dedicatedTo" TEXT,
ADD COLUMN     "dedicationMessage" TEXT,
ADD COLUMN     "dedicationType" TEXT,
ADD COLUMN     "isDedicated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smsKeyword" TEXT,
ADD COLUMN     "smsShortCode" TEXT;

-- AlterTable
ALTER TABLE "DonationCampaign" ADD COLUMN     "beneficiaryCount" INTEGER DEFAULT 0,
ADD COLUMN     "donorCount" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "ValidationRule" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "ruleValue" TEXT,
    "errorMessage" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValidationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignSettings" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
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
    "showProgress" BOOLEAN NOT NULL DEFAULT true,
    "showDonorCount" BOOLEAN NOT NULL DEFAULT true,
    "showBeneficiaries" BOOLEAN NOT NULL DEFAULT true,
    "impactMetrics" JSONB,
    "successStories" JSONB,
    "customCss" TEXT,
    "customJs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" SERIAL NOT NULL,
    "settingKey" TEXT NOT NULL,
    "settingValue" JSONB NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ValidationRule_entityType_idx" ON "ValidationRule"("entityType");

-- CreateIndex
CREATE INDEX "ValidationRule_fieldName_idx" ON "ValidationRule"("fieldName");

-- CreateIndex
CREATE INDEX "ValidationRule_isActive_idx" ON "ValidationRule"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ValidationRule_entityType_fieldName_ruleType_key" ON "ValidationRule"("entityType", "fieldName", "ruleType");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignSettings_campaignId_key" ON "CampaignSettings"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSettings_settingKey_key" ON "SystemSettings"("settingKey");

-- CreateIndex
CREATE INDEX "SystemSettings_category_idx" ON "SystemSettings"("category");

-- CreateIndex
CREATE INDEX "SystemSettings_isActive_idx" ON "SystemSettings"("isActive");

-- CreateIndex
CREATE INDEX "SystemSettings_isPublic_idx" ON "SystemSettings"("isPublic");

-- CreateIndex
CREATE INDEX "Donation_isDedicated_idx" ON "Donation"("isDedicated");

-- AddForeignKey
ALTER TABLE "CampaignSettings" ADD CONSTRAINT "CampaignSettings_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "DonationCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
