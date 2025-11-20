-- AlterTable
ALTER TABLE "ProjectTranslation" ADD COLUMN     "builderCss" TEXT,
ADD COLUMN     "builderData" JSONB,
ADD COLUMN     "builderHtml" TEXT,
ADD COLUMN     "usePageBuilder" BOOLEAN NOT NULL DEFAULT false;
