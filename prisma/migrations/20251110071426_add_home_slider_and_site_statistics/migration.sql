-- CreateTable
CREATE TABLE "HomeSlider" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "projectId" INTEGER,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSlider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteStatistics" (
    "id" SERIAL NOT NULL,
    "countryCount" INTEGER NOT NULL DEFAULT 0,
    "examinationCount" INTEGER NOT NULL DEFAULT 0,
    "surgeryCount" INTEGER NOT NULL DEFAULT 0,
    "volunteerCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomeSlider_displayOrder_idx" ON "HomeSlider"("displayOrder");

-- CreateIndex
CREATE INDEX "HomeSlider_isActive_idx" ON "HomeSlider"("isActive");

-- AddForeignKey
ALTER TABLE "HomeSlider" ADD CONSTRAINT "HomeSlider_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
