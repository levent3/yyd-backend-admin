-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "failedAt" TIMESTAMP(3),
ADD COLUMN     "gatewayResponse" JSONB,
ADD COLUMN     "installment" INTEGER DEFAULT 1,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "repeatCount" INTEGER DEFAULT 1,
ADD COLUMN     "userAgent" TEXT;

-- AlterTable
ALTER TABLE "RecurringDonation" ADD COLUMN     "campaignId" INTEGER,
ADD COLUMN     "cardBrand" TEXT,
ADD COLUMN     "cardMask" TEXT,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "failedAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastFailureReason" TEXT,
ADD COLUMN     "notificationSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pausedAt" TIMESTAMP(3),
ADD COLUMN     "paymentGateway" TEXT DEFAULT 'iyzico',
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "totalPaymentsMade" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPaymentsPlanned" INTEGER;

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentGateway" TEXT NOT NULL,
    "gatewayTransactionId" TEXT,
    "gatewayResponse" JSONB,
    "gatewayErrorCode" TEXT,
    "gatewayErrorMessage" TEXT,
    "threeDSecure" BOOLEAN NOT NULL DEFAULT false,
    "conversationId" TEXT,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "donationId" TEXT,
    "recurringDonationId" INTEGER,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "donationType" TEXT NOT NULL DEFAULT 'one_time',
    "repeatCount" INTEGER DEFAULT 1,
    "campaignId" INTEGER,
    "donorName" TEXT,
    "donorEmail" TEXT,
    "donorPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_paymentGateway_idx" ON "PaymentTransaction"("paymentGateway");

-- CreateIndex
CREATE INDEX "PaymentTransaction_donationId_idx" ON "PaymentTransaction"("donationId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_recurringDonationId_idx" ON "PaymentTransaction"("recurringDonationId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_createdAt_idx" ON "PaymentTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "CartItem_sessionId_idx" ON "CartItem"("sessionId");

-- CreateIndex
CREATE INDEX "CartItem_campaignId_idx" ON "CartItem"("campaignId");

-- CreateIndex
CREATE INDEX "CartItem_expiresAt_idx" ON "CartItem"("expiresAt");

-- CreateIndex
CREATE INDEX "Donation_paymentGateway_idx" ON "Donation"("paymentGateway");

-- CreateIndex
CREATE INDEX "RecurringDonation_donorId_idx" ON "RecurringDonation"("donorId");

-- CreateIndex
CREATE INDEX "RecurringDonation_status_idx" ON "RecurringDonation"("status");

-- CreateIndex
CREATE INDEX "RecurringDonation_nextPaymentDate_idx" ON "RecurringDonation"("nextPaymentDate");

-- CreateIndex
CREATE INDEX "RecurringDonation_campaignId_idx" ON "RecurringDonation"("campaignId");

-- AddForeignKey
ALTER TABLE "RecurringDonation" ADD CONSTRAINT "RecurringDonation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "DonationCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_recurringDonationId_fkey" FOREIGN KEY ("recurringDonationId") REFERENCES "RecurringDonation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "DonationCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
