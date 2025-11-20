/**
 * Migration: Project Content → Page Builder
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

async function migrateProjectContents() {
  const results = {
    success: 0,
    skipped: 0,
    error: 0,
    details: []
  };

  try {
    // Tüm project translation'ları çek (content'i olan)
    const translations = await prisma.projectTranslation.findMany({
      where: {
        OR: [
          { content: { not: null } },
          { content: { not: '' } }
        ],
        usePageBuilder: false
      },
      include: {
        project: {
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
      const projectTitle = translation.project.translations.find(t => t.language === translation.language)?.title || 'Başlıksız';

      // Eğer zaten builderData varsa, atla
      if (translation.builderData && translation.builderData !== null) {
        results.skipped++;
        results.details.push({
          projectId: translation.projectId,
          language: translation.language,
          title: projectTitle,
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
          projectId: translation.projectId,
          language: translation.language,
          title: projectTitle,
          status: 'skipped',
          reason: 'Empty content'
        });
        continue;
      }

      try {
        // Database'e kaydet
        await prisma.projectTranslation.update({
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
          projectId: translation.projectId,
          language: translation.language,
          title: projectTitle,
          status: 'success',
          widgetCount: widgets.length
        });
      } catch (error) {
        results.error++;
        results.details.push({
          projectId: translation.projectId,
          language: translation.language,
          title: projectTitle,
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

module.exports = { migrateProjectContents };
