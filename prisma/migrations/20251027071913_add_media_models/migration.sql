/*
  Warnings:

  - You are about to drop the column `description` on the `DonationCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `DonationCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `DonationCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `News` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `excerpt` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `metaDescription` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `metaKeywords` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `metaTitle` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Project` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."DonationCampaign_slug_idx";

-- DropIndex
DROP INDEX "public"."DonationCampaign_slug_key";

-- DropIndex
DROP INDEX "public"."DonationCampaign_title_key";

-- DropIndex
DROP INDEX "public"."News_slug_idx";

-- DropIndex
DROP INDEX "public"."News_slug_key";

-- DropIndex
DROP INDEX "public"."Page_slug_idx";

-- DropIndex
DROP INDEX "public"."Page_slug_key";

-- DropIndex
DROP INDEX "public"."Project_slug_idx";

-- DropIndex
DROP INDEX "public"."Project_slug_key";

-- AlterTable
ALTER TABLE "DonationCampaign" DROP COLUMN "description",
DROP COLUMN "slug",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "News" DROP COLUMN "content",
DROP COLUMN "slug",
DROP COLUMN "summary",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "Page" DROP COLUMN "content",
DROP COLUMN "excerpt",
DROP COLUMN "metaDescription",
DROP COLUMN "metaKeywords",
DROP COLUMN "metaTitle",
DROP COLUMN "slug",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "content",
DROP COLUMN "description",
DROP COLUMN "slug",
DROP COLUMN "title";

-- CreateTable
CREATE TABLE "ProjectTranslation" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsTranslation" (
    "id" SERIAL NOT NULL,
    "newsId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageTranslation" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "excerpt" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignTranslation" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandAsset" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "fileSize" INTEGER,
    "language" TEXT,
    "version" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brochure" (
    "id" SERIAL NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "fileSize" INTEGER,
    "category" TEXT,
    "projectId" INTEGER,
    "campaignId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brochure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrochureTranslation" (
    "id" SERIAL NOT NULL,
    "brochureId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrochureTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicSpot" (
    "id" SERIAL NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "videoType" TEXT NOT NULL DEFAULT 'youtube',
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "category" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSpot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicSpotTranslation" (
    "id" SERIAL NOT NULL,
    "spotId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSpotTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessStory" (
    "id" SERIAL NOT NULL,
    "coverImage" TEXT,
    "images" JSONB,
    "location" TEXT,
    "country" TEXT,
    "projectId" INTEGER,
    "campaignId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessStoryTranslation" (
    "id" SERIAL NOT NULL,
    "storyId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessStoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaCoverage" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'internet',
    "externalUrl" TEXT,
    "imageUrl" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaCoverage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectTranslation_language_idx" ON "ProjectTranslation"("language");

-- CreateIndex
CREATE INDEX "ProjectTranslation_slug_idx" ON "ProjectTranslation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTranslation_projectId_language_key" ON "ProjectTranslation"("projectId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTranslation_language_slug_key" ON "ProjectTranslation"("language", "slug");

-- CreateIndex
CREATE INDEX "NewsTranslation_language_idx" ON "NewsTranslation"("language");

-- CreateIndex
CREATE INDEX "NewsTranslation_slug_idx" ON "NewsTranslation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NewsTranslation_newsId_language_key" ON "NewsTranslation"("newsId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "NewsTranslation_language_slug_key" ON "NewsTranslation"("language", "slug");

-- CreateIndex
CREATE INDEX "PageTranslation_language_idx" ON "PageTranslation"("language");

-- CreateIndex
CREATE INDEX "PageTranslation_slug_idx" ON "PageTranslation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PageTranslation_pageId_language_key" ON "PageTranslation"("pageId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "PageTranslation_language_slug_key" ON "PageTranslation"("language", "slug");

-- CreateIndex
CREATE INDEX "CampaignTranslation_language_idx" ON "CampaignTranslation"("language");

-- CreateIndex
CREATE INDEX "CampaignTranslation_slug_idx" ON "CampaignTranslation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignTranslation_campaignId_language_key" ON "CampaignTranslation"("campaignId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignTranslation_language_slug_key" ON "CampaignTranslation"("language", "slug");

-- CreateIndex
CREATE INDEX "BrandAsset_fileType_idx" ON "BrandAsset"("fileType");

-- CreateIndex
CREATE INDEX "BrandAsset_isActive_idx" ON "BrandAsset"("isActive");

-- CreateIndex
CREATE INDEX "Brochure_category_idx" ON "Brochure"("category");

-- CreateIndex
CREATE INDEX "Brochure_isActive_idx" ON "Brochure"("isActive");

-- CreateIndex
CREATE INDEX "Brochure_publishedAt_idx" ON "Brochure"("publishedAt");

-- CreateIndex
CREATE INDEX "BrochureTranslation_language_idx" ON "BrochureTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "BrochureTranslation_brochureId_language_key" ON "BrochureTranslation"("brochureId", "language");

-- CreateIndex
CREATE INDEX "PublicSpot_category_idx" ON "PublicSpot"("category");

-- CreateIndex
CREATE INDEX "PublicSpot_isActive_idx" ON "PublicSpot"("isActive");

-- CreateIndex
CREATE INDEX "PublicSpot_publishedAt_idx" ON "PublicSpot"("publishedAt");

-- CreateIndex
CREATE INDEX "PublicSpotTranslation_language_idx" ON "PublicSpotTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "PublicSpotTranslation_spotId_language_key" ON "PublicSpotTranslation"("spotId", "language");

-- CreateIndex
CREATE INDEX "SuccessStory_location_idx" ON "SuccessStory"("location");

-- CreateIndex
CREATE INDEX "SuccessStory_isActive_idx" ON "SuccessStory"("isActive");

-- CreateIndex
CREATE INDEX "SuccessStory_publishedAt_idx" ON "SuccessStory"("publishedAt");

-- CreateIndex
CREATE INDEX "SuccessStoryTranslation_language_idx" ON "SuccessStoryTranslation"("language");

-- CreateIndex
CREATE INDEX "SuccessStoryTranslation_slug_idx" ON "SuccessStoryTranslation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SuccessStoryTranslation_storyId_language_key" ON "SuccessStoryTranslation"("storyId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "SuccessStoryTranslation_language_slug_key" ON "SuccessStoryTranslation"("language", "slug");

-- CreateIndex
CREATE INDEX "MediaCoverage_sourceType_idx" ON "MediaCoverage"("sourceType");

-- CreateIndex
CREATE INDEX "MediaCoverage_isActive_idx" ON "MediaCoverage"("isActive");

-- CreateIndex
CREATE INDEX "MediaCoverage_publishedAt_idx" ON "MediaCoverage"("publishedAt");

-- AddForeignKey
ALTER TABLE "ProjectTranslation" ADD CONSTRAINT "ProjectTranslation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsTranslation" ADD CONSTRAINT "NewsTranslation_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageTranslation" ADD CONSTRAINT "PageTranslation_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTranslation" ADD CONSTRAINT "CampaignTranslation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "DonationCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brochure" ADD CONSTRAINT "Brochure_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brochure" ADD CONSTRAINT "Brochure_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "DonationCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrochureTranslation" ADD CONSTRAINT "BrochureTranslation_brochureId_fkey" FOREIGN KEY ("brochureId") REFERENCES "Brochure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicSpotTranslation" ADD CONSTRAINT "PublicSpotTranslation_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "PublicSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStory" ADD CONSTRAINT "SuccessStory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStory" ADD CONSTRAINT "SuccessStory_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "DonationCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessStoryTranslation" ADD CONSTRAINT "SuccessStoryTranslation_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "SuccessStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
