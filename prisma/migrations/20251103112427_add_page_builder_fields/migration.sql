-- AlterTable
ALTER TABLE "PageTranslation" ADD COLUMN IF NOT EXISTS "builderData" JSONB,
ADD COLUMN IF NOT EXISTS "builderHtml" TEXT,
ADD COLUMN IF NOT EXISTS "builderCss" TEXT;

-- AddComments
COMMENT ON COLUMN "PageTranslation"."builderData" IS 'Lexical editor JSON state';
COMMENT ON COLUMN "PageTranslation"."builderHtml" IS 'Generated HTML from Lexical editor';
COMMENT ON COLUMN "PageTranslation"."builderCss" IS 'Generated CSS from page builder';
