-- CreateTable
CREATE TABLE "Bank" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isOurBank" BOOLEAN NOT NULL DEFAULT false,
    "isVirtualPosActive" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BinCode" (
    "id" SERIAL NOT NULL,
    "binCode" TEXT NOT NULL,
    "bankId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BinCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BinCode_binCode_key" ON "BinCode"("binCode");

-- CreateIndex
CREATE INDEX "Bank_isActive_idx" ON "Bank"("isActive");

-- CreateIndex
CREATE INDEX "Bank_displayOrder_idx" ON "Bank"("displayOrder");

-- CreateIndex
CREATE INDEX "BinCode_bankId_idx" ON "BinCode"("bankId");

-- CreateIndex
CREATE INDEX "BinCode_isActive_idx" ON "BinCode"("isActive");

-- CreateIndex
CREATE INDEX "BinCode_binCode_idx" ON "BinCode"("binCode");

-- AddForeignKey
ALTER TABLE "BinCode" ADD CONSTRAINT "BinCode_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;
