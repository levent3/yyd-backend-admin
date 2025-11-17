/*
  Warnings:

  - You are about to drop the column `accountName` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `BankAccount` table. All the data in the column will be lost.
  - You are about to drop the column `buttonLink` on the `HomeSlider` table. All the data in the column will be lost.
  - You are about to drop the column `buttonText` on the `HomeSlider` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `HomeSlider` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `HomeSlider` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "accountName",
DROP COLUMN "bankName";

-- AlterTable
ALTER TABLE "HomeSlider" DROP COLUMN "buttonLink",
DROP COLUMN "buttonText",
DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "mobileImageUrl" TEXT,
ADD COLUMN     "showTitle" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "BankAccountTranslation" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccountTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeSliderTranslation" (
    "id" SERIAL NOT NULL,
    "sliderId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "summary" TEXT,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSliderTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BankAccountTranslation_language_idx" ON "BankAccountTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccountTranslation_accountId_language_key" ON "BankAccountTranslation"("accountId", "language");

-- CreateIndex
CREATE INDEX "HomeSliderTranslation_language_idx" ON "HomeSliderTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "HomeSliderTranslation_sliderId_language_key" ON "HomeSliderTranslation"("sliderId", "language");

-- CreateIndex
CREATE INDEX "BankAccount_isActive_idx" ON "BankAccount"("isActive");

-- CreateIndex
CREATE INDEX "BankAccount_currency_idx" ON "BankAccount"("currency");

-- CreateIndex
CREATE INDEX "HomeSlider_startDate_idx" ON "HomeSlider"("startDate");

-- CreateIndex
CREATE INDEX "HomeSlider_endDate_idx" ON "HomeSlider"("endDate");

-- AddForeignKey
ALTER TABLE "BankAccountTranslation" ADD CONSTRAINT "BankAccountTranslation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BankAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeSliderTranslation" ADD CONSTRAINT "HomeSliderTranslation_sliderId_fkey" FOREIGN KEY ("sliderId") REFERENCES "HomeSlider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
