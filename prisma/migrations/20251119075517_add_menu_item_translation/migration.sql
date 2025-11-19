-- AlterTable
ALTER TABLE "MenuItem" ALTER COLUMN "title" DROP NOT NULL;

-- CreateTable
CREATE TABLE "MenuItemTranslation" (
    "id" SERIAL NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItemTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenuItemTranslation_language_idx" ON "MenuItemTranslation"("language");

-- CreateIndex
CREATE INDEX "MenuItemTranslation_menuItemId_idx" ON "MenuItemTranslation"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuItemTranslation_menuItemId_language_key" ON "MenuItemTranslation"("menuItemId", "language");

-- AddForeignKey
ALTER TABLE "MenuItemTranslation" ADD CONSTRAINT "MenuItemTranslation_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
