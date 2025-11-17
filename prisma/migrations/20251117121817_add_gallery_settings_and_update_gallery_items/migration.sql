/*
  Warnings:

  - Added the required column `updatedAt` to the `GalleryItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GalleryItem" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "GallerySettings" (
    "id" SERIAL NOT NULL,
    "coverImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GallerySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GallerySettingsTranslation" (
    "id" SERIAL NOT NULL,
    "settingsId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "GallerySettingsTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GallerySettingsTranslation_language_idx" ON "GallerySettingsTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "GallerySettingsTranslation_settingsId_language_key" ON "GallerySettingsTranslation"("settingsId", "language");

-- CreateIndex
CREATE INDEX "GalleryItem_displayOrder_idx" ON "GalleryItem"("displayOrder");

-- AddForeignKey
ALTER TABLE "GallerySettingsTranslation" ADD CONSTRAINT "GallerySettingsTranslation_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "GallerySettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
