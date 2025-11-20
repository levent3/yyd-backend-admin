/**
 * Migration: Brochure Content → Page Builder
 * API Endpoint olarak çalışır
 */

const prisma = require('../../../../config/prismaClient');

// HTML içeriğini Page Builder widget'ına dönüştür
function convertContentToBuilderWidget(description) {
  if (!description || description.trim() === '') {
    return [];
  }

  const widgetId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return [
    {
      id: widgetId,
      type: 'paragraph',
      content: description.trim(),
      styles: {
        fontSize: '16px',
        color: '#333333',
        textAlign: 'left'
      }
    }
  ];
}

async function migrateBrochureContents() {
  const results = {
    success: 0,
    skipped: 0,
    error: 0,
    details: []
  };

  try {
    // Tüm brochure translation'ları çek (description'ı olan)
    const translations = await prisma.brochureTranslation.findMany({
      where: {
        OR: [
          { description: { not: null } },
          { description: { not: '' } }
        ],
        usePageBuilder: false
      },
      include: {
        brochure: {
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
      const brochureTitle = translation.brochure.translations.find(t => t.language === translation.language)?.title || 'Başlıksız';

      // Eğer zaten builderData varsa, atla
      if (translation.builderData && translation.builderData !== null) {
        results.skipped++;
        results.details.push({
          brochureId: translation.brochureId,
          language: translation.language,
          title: brochureTitle,
          status: 'skipped',
          reason: 'Already has builderData'
        });
        continue;
      }

      // Description'ı widget'a dönüştür
      const widgets = convertContentToBuilderWidget(translation.description);

      if (widgets.length === 0) {
        results.skipped++;
        results.details.push({
          brochureId: translation.brochureId,
          language: translation.language,
          title: brochureTitle,
          status: 'skipped',
          reason: 'Empty description'
        });
        continue;
      }

      try {
        // Database'e kaydet
        await prisma.brochureTranslation.update({
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
          brochureId: translation.brochureId,
          language: translation.language,
          title: brochureTitle,
          status: 'success',
          widgetCount: widgets.length
        });
      } catch (error) {
        results.error++;
        results.details.push({
          brochureId: translation.brochureId,
          language: translation.language,
          title: brochureTitle,
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

module.exports = { migrateBrochureContents };
