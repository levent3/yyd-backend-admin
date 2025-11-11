/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `Donation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "authCode" TEXT,
ADD COLUMN     "cardBin" TEXT,
ADD COLUMN     "cardLastFour" TEXT,
ADD COLUMN     "hostRefNum" TEXT,
ADD COLUMN     "mac" TEXT,
ADD COLUMN     "orderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Donation_orderId_key" ON "Donation"("orderId");

-- CreateIndex
CREATE INDEX "Donation_orderId_idx" ON "Donation"("orderId");
