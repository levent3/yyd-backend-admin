-- AlterTable
ALTER TABLE "Project" ADD COLUMN "shortCode" VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "Project_shortCode_key" ON "Project"("shortCode");
