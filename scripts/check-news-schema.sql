-- MSSQL News tablosu yapısını kontrol et
USE YeryuzuDoktorlari;
GO

-- Kolon isimlerini ve tiplerini listele
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'YeryuzuDoktorlari_News'
ORDER BY ORDINAL_POSITION;
GO

-- Kayıt sayısını kontrol et
SELECT COUNT(*) as TotalNews FROM YeryuzuDoktorlari_News;
GO

-- Örnek birkaç kayıt
SELECT TOP 3
    Id,
    ContentId,
    SiteLanguageId,
    Title,
    Slug,
    CreateDate,
    UpdateDate
FROM YeryuzuDoktorlari_News
ORDER BY CreateDate DESC;
GO
