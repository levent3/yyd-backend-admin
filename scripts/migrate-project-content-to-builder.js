/**
 * Migration Script: Project Content → Page Builder
 *
 * Bu script mevcut projelerdeki "content" field'ını page builder formatına dönüştürür.
 * Her dil için ayrı çalışır ve builderData oluşturur.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// HTML içeriğini Page Builder widget'ına dönüştür
function convertContentToBuilderWidget(content) {
  if (!content || content.trim() === '') {
    return [];
  }

  // Basit yaklaşım: Tüm HTML'i bir paragraph widget olarak ekle
  // Widget ID için unique id oluştur
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
  console.log('🚀 Migration başlıyor: Project Content → Page Builder\n');

  try {
    // Tüm project translation'ları çek (content'i olan)
    const translations = await prisma.projectTranslation.findMany({
      where: {
        OR: [
          { content: { not: null } },
          { content: { not: '' } }
        ],
        // Sadece henüz migrate edilmemiş olanları al
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

    console.log(`📊 Toplam ${translations.length} translation bulundu.\n`);

    if (translations.length === 0) {
      console.log('✅ Migrate edilecek veri yok veya tümü zaten migrate edilmiş!');
      return;
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const translation of translations) {
      const projectTitle = translation.project.translations.find(t => t.language === translation.language)?.title || 'Başlıksız';

      console.log(`\n📝 İşleniyor: Project #${translation.projectId} - ${projectTitle} (${translation.language})`);

      // Eğer zaten builderData varsa, atla
      if (translation.builderData && translation.builderData !== null) {
        console.log('   ⏭️  Zaten builderData var, atlanıyor...');
        skipCount++;
        continue;
      }

      // Content'i widget'a dönüştür
      const widgets = convertContentToBuilderWidget(translation.content);

      if (widgets.length === 0) {
        console.log('   ⏭️  İçerik boş, atlanıyor...');
        skipCount++;
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

        console.log(`   ✅ Başarıyla migrate edildi! (${widgets.length} widget)`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Hata: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 MİGRATİON RAPORU:');
    console.log('='.repeat(60));
    console.log(`✅ Başarılı: ${successCount}`);
    console.log(`⏭️  Atlanan:  ${skipCount}`);
    console.log(`❌ Hata:     ${errorCount}`);
    console.log(`📦 Toplam:   ${translations.length}`);
    console.log('='.repeat(60));

    if (successCount > 0) {
      console.log('\n🎉 Migration tamamlandı! Page Builder artık aktif.');
      console.log('💡 İpucu: Eski "content" field\'ı hala korunuyor (yedek olarak).');
    }

  } catch (error) {
    console.error('\n❌ Migration hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
if (require.main === module) {
  migrateProjectContents()
    .then(() => {
      console.log('\n✅ Script başarıyla tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script hatası:', error);
      process.exit(1);
    });
}

module.exports = { migrateProjectContents, convertContentToBuilderWidget };
