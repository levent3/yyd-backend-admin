-- Add page builder fields to PageTranslation table
ALTER TABLE "PageTranslation"
ADD COLUMN IF NOT EXISTS "builderData" JSONB,
ADD COLUMN IF NOT EXISTS "builderHtml" TEXT,
ADD COLUMN IF NOT EXISTS "builderCss" TEXT;

-- Add comment
COMMENT ON COLUMN "PageTranslation"."builderData" IS 'GrapesJS or page builder JSON data';
COMMENT ON COLUMN "PageTranslation"."builderHtml" IS 'Generated HTML from page builder';
COMMENT ON COLUMN "PageTranslation"."builderCss" IS 'Generated CSS from page builder';
