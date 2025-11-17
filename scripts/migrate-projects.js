/**
 * MSSQL YeryuzuDoktorlari_Project → PostgreSQL Project Migration
 *
 * Bu script MSSQL'deki projeleri PostgreSQL'e migrate eder.
 *
 * Strateji:
 * 1. MSSQL'den tüm projeleri çek (ContentId bazında grupla)
 * 2. Her ContentId için:
 *    a) Project tablosuna 1 kayıt ekle (ana proje)
 *    b) Her dil için ProjectTranslation ekle
 */

const sql = require('mssql');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// MSSQL Bağlantı Ayarları (LocalDB)
const mssqlConfig = {
  server: '(localdb)\\MSSQLLocalDB',
  database: 'YeryuzuDoktorlari',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    useUTC: false,
    port: 1433,
  },
  driver: 'tedious',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Dil Mapping
const LANGUAGE_MAP = {
  'BF2689D9-071E-4A20-9450-B1DBDD39778F': 'tr',
  '7C35F456-9403-4C21-80B6-941129D14086': 'en',
  '8FAB2BF3-F2E1-4D54-B668-8DD588575FE4': 'ar',
};

async function migrateProjects() {
  let mssqlPool;

  try {
    console.log('🔌 MSSQL bağlantısı kuruluyor...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ MSSQL bağlantısı başarılı!');

    // 1. MSSQL'den tüm projeleri çek
    console.log('\n📊 MSSQL\'den projeler çekiliyor...');
    const result = await mssqlPool.request().query(`
      SELECT
        Id,
        ContentId,
        SiteLanguageId,
        Title,
        Slug,
        ThumbnailImage,
        Image,
        Summary,
        Content,
        Budget,
        TotalBudget,
        StartDate,
        EndDate,
        OrderNo,
        IsShowedHomePage,
        CreateDate,
        UpdateDate
      FROM YeryuzuDoktorlari_Project
      ORDER BY ContentId, SiteLanguageId
    `);

    console.log(`✅ ${result.recordset.length} proje satırı bulundu`);

    // 2. ContentId bazında grupla
    const projectsByContentId = {};
    result.recordset.forEach(row => {
      const contentId = row.ContentId;
      if (!projectsByContentId[contentId]) {
        projectsByContentId[contentId] = [];
      }
      projectsByContentId[contentId].push(row);
    });

    const uniqueProjects = Object.keys(projectsByContentId).length;
    console.log(`\n📦 ${uniqueProjects} unique proje bulundu`);

    // 3. Her ContentId için migrate et
    let migratedCount = 0;
    let skippedCount = 0;

    for (const [contentId, projectRows] of Object.entries(projectsByContentId)) {
      try {
        // İlk satırı referans al (proje ana bilgileri için)
        const mainRow = projectRows[0];

        console.log(`\n📝 Migrate ediliyor: ${mainRow.Title} (${projectRows.length} dil)`);

        // a) Project tablosuna ekle
        const project = await prisma.project.create({
          data: {
            imageUrl: mainRow.ThumbnailImage || mainRow.Image,
            coverImage: mainRow.Image,
            budget: mainRow.Budget || mainRow.TotalBudget,
            targetAmount: mainRow.Budget || mainRow.TotalBudget,
            startDate: mainRow.StartDate,
            endDate: mainRow.EndDate,
            displayOrder: mainRow.OrderNo || 0,
            isFeatured: mainRow.IsShowedHomePage || false,
            status: 'active',
            isActive: true,
            createdAt: mainRow.CreateDate,
            updatedAt: mainRow.UpdateDate,
          },
        });

        console.log(`   ✅ Project oluşturuldu: ID=${project.id}`);

        // b) Her dil için ProjectTranslation ekle
        for (const row of projectRows) {
          const language = LANGUAGE_MAP[row.SiteLanguageId];

          if (!language) {
            console.log(`   ⚠️  Bilinmeyen dil: ${row.SiteLanguageId}, atlanıyor`);
            continue;
          }

          await prisma.projectTranslation.create({
            data: {
              projectId: project.id,
              language: language,
              title: row.Title,
              slug: row.Slug || `project-${project.id}-${language}`,
              description: row.Summary,
              content: row.Content,
            },
          });

          console.log(`   ✅ Translation eklendi: ${language} - ${row.Title}`);
        }

        migratedCount++;
      } catch (error) {
        console.error(`   ❌ Hata: ${error.message}`);
        skippedCount++;
      }
    }

    console.log(`\n✅ Migration tamamlandı!`);
    console.log(`   📊 Başarılı: ${migratedCount}`);
    console.log(`   ⚠️  Atlanan: ${skippedCount}`);

  } catch (error) {
    console.error('❌ Migration hatası:', error);
    throw error;
  } finally {
    // Bağlantıları kapat
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 MSSQL bağlantısı kapatıldı');
    }
    await prisma.$disconnect();
    console.log('🔌 PostgreSQL bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
if (require.main === module) {
  migrateProjects()
    .then(() => {
      console.log('\n🎉 İşlem başarıyla tamamlandı!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 İşlem başarısız:', error);
      process.exit(1);
    });
}

module.exports = { migrateProjects };
