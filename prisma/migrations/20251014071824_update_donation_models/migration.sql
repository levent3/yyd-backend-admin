/*
  Warnings:

  - You are about to drop the column `status` on the `Donation` table. All the data in the column will be lost.
  - Added the required column `paymentMethod` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DonationCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Donor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Donation" DROP CONSTRAINT "Donation_campaignId_fkey";

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "status",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN     "donorEmail" TEXT,
ADD COLUMN     "donorName" TEXT,
ADD COLUMN     "donorPhone" TEXT,
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "paymentGateway" TEXT,
ADD COLUMN     "paymentMethod" TEXT NOT NULL,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "receiptSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "campaignId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DonationCampaign" ADD COLUMN     "category" TEXT,
ADD COLUMN     "collectedAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectId" INTEGER,
ADD COLUMN     "targetAmount" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Donor" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'Türkiye',
ADD COLUMN     "taxNumber" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "RecurringDonation" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "paymentMethod" TEXT NOT NULL DEFAULT 'credit_card',
    "cardToken" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "nextPaymentDate" TIMESTAMP(3),
    "lastPaymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "donorId" INTEGER NOT NULL,

    CONSTRAINT "RecurringDonation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" SERIAL NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "swift" TEXT,
    "accountNumber" TEXT,
    "branch" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_iban_key" ON "BankAccount"("iban");

-- AddForeignKey
ALTER TABLE "DonationCampaign" ADD CONSTRAINT "DonationCampaign_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "DonationCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringDonation" ADD CONSTRAINT "RecurringDonation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
