/*
  Warnings:

  - You are about to drop the column `linkId` on the `MenuItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."MenuItem" DROP CONSTRAINT "MenuItem_page_fkey";

-- DropForeignKey
ALTER TABLE "public"."MenuItem" DROP CONSTRAINT "MenuItem_project_fkey";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "linkId",
ADD COLUMN     "activityAreaId" INTEGER,
ADD COLUMN     "newsId" INTEGER,
ADD COLUMN     "pageId" INTEGER,
ADD COLUMN     "projectId" INTEGER;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_activityAreaId_fkey" FOREIGN KEY ("activityAreaId") REFERENCES "ActivityArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
