/**
 * Migration: News Content → Page Builder
 * API Endpoint olarak çalışır
 */

const prisma = require('../../../../config/prismaClient');

// HTML içeriğini Page Builder widget'ına dönüştür
function convertContentToBuilderWidget(content) {
  if (!content || content.trim() === '') {
    return [];
  }

  const widgetId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return [
    {
      id: widgetId,
      type: 'paragraph',
      content: content.trim(),
      styles: {
        fontSize: '16px',
        color: '#333333',
        textAlign: 'left'
      }
    }
  ];
}

async function migrateNewsContents() {
  const results = {
    success: 0,
    skipped: 0,
    error: 0,
    details: []
  };

  try {
    // Tüm news translation'ları çek (content'i olan)
    const translations = await prisma.newsTranslation.findMany({
      where: {
        OR: [
          { content: { not: null } },
          { content: { not: '' } }
        ],
        usePageBuilder: false
      },
      include: {
        news: {
          select: {
            id: true,
            translations: {
              select: {
                language: true,
                title: true
              }
            }
          }
        }
      }
    });

    for (const translation of translations) {
      const newsTitle = translation.news.translations.find(t => t.language === translation.language)?.title || 'Başlıksız';

      // Eğer zaten builderData varsa, atla
      if (translation.builderData && translation.builderData !== null) {
        results.skipped++;
        results.details.push({
          newsId: translation.newsId,
          language: translation.language,
          title: newsTitle,
          status: 'skipped',
          reason: 'Already has builderData'
        });
        continue;
      }

      // Content'i widget'a dönüştür
      const widgets = convertContentToBuilderWidget(translation.content);

      if (widgets.length === 0) {
        results.skipped++;
        results.details.push({
          newsId: translation.newsId,
          language: translation.language,
          title: newsTitle,
          status: 'skipped',
          reason: 'Empty content'
        });
        continue;
      }

      try {
        // Database'e kaydet
        await prisma.newsTranslation.update({
          where: {
            id: translation.id
          },
          data: {
            builderData: widgets,
            usePageBuilder: true,
            updatedAt: new Date()
          }
        });

        results.success++;
        results.details.push({
          newsId: translation.newsId,
          language: translation.language,
          title: newsTitle,
          status: 'success',
          widgetCount: widgets.length
        });
      } catch (error) {
        results.error++;
        results.details.push({
          newsId: translation.newsId,
          language: translation.language,
          title: newsTitle,
          status: 'error',
          error: error.message
        });
      }
    }

    return {
      total: translations.length,
      ...results
    };

  } catch (error) {
    throw error;
  }
}

module.exports = { migrateNewsContents };
