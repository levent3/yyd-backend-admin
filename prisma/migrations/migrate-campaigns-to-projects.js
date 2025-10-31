/**
 * Data Migration Script: Campaign to Project
 *
 * Bu script DonationCampaign modelinden Project modeline veri taşır.
 * Campaign modeli kaldırıldığı için, mevcut campaign verileri project'lere dönüştürülecek.
 *
 * ÇALIŞTIRMADAN ÖNCE:
 * 1. Veritabanı yedeği alın!
 * 2. Bu scripti test ortamında çalıştırıp test edin
 * 3. Production'da çalıştırmadan önce staging'de test edin
 *
 * ÇALIŞTIRMA:
 * node prisma/migrations/migrate-campaigns-to-projects.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Migration başlatılıyor: DonationCampaign -> Project');
  console.log('========================================================\n');

  // Migration öncesi kontrol
  try {
    // 1. Mevcut campaign'leri kontrol et
    const campaignCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "DonationCampaign"`;
    console.log(`📊 Toplam ${campaignCount[0].count} campaign bulundu.\n`);

    if (campaignCount[0].count === 0) {
      console.log('✅ Hiç campaign yok, migration gerekmiyor.');
      return;
    }

    // 2. Campaign'leri getir
    const campaigns = await prisma.$queryRaw`
      SELECT * FROM "DonationCampaign" ORDER BY id ASC
    `;

    console.log(`🔄 ${campaigns.length} campaign işlenecek...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const campaign of campaigns) {
      try {
        console.log(`\n📦 Campaign ID ${campaign.id} işleniyor...`);
        console.log(`   Proje ID: ${campaign.projectId || 'YOK'}`);

        // Campaign'in bir projesi var mı kontrol et
        if (campaign.projectId) {
          // Eğer campaign'in zaten bir projesi varsa,
          // campaign verilerini o projeye merge et
          console.log(`   ✓ Mevcut projeye (ID: ${campaign.projectId}) merge ediliyor...`);

          // Proje verilerini güncelle
          await prisma.$executeRaw`
            UPDATE "Project"
            SET
              "targetAmount" = COALESCE("targetAmount", ${campaign.targetAmount}),
              "collectedAmount" = COALESCE("collectedAmount", 0) + ${campaign.collectedAmount || 0},
              "donorCount" = COALESCE("donorCount", 0) + ${campaign.donorCount || 0},
              "beneficiaryCount" = COALESCE("beneficiaryCount", ${campaign.beneficiaryCount}),
              "imageUrl" = COALESCE("imageUrl", ${campaign.imageUrl}),
              "isFeatured" = COALESCE("isFeatured", ${campaign.isFeatured}),
              "displayOrder" = COALESCE("displayOrder", ${campaign.displayOrder}),
              "updatedAt" = NOW()
            WHERE id = ${campaign.projectId}
          `;

          // Campaign translations'ları proje translations'larına ekle (varsa)
          const campaignTranslations = await prisma.$queryRaw`
            SELECT * FROM "CampaignTranslation" WHERE "campaignId" = ${campaign.id}
          `;

          for (const trans of campaignTranslations) {
            // Aynı dilde translation varsa update, yoksa insert
            await prisma.$executeRaw`
              INSERT INTO "ProjectTranslation" ("projectId", "language", "title", "slug", "description", "createdAt", "updatedAt")
              VALUES (${campaign.projectId}, ${trans.language}, ${trans.title}, ${trans.slug}, ${trans.description}, NOW(), NOW())
              ON CONFLICT ("projectId", "language")
              DO UPDATE SET
                "title" = EXCLUDED."title",
                "slug" = EXCLUDED."slug",
                "description" = COALESCE("ProjectTranslation"."description", EXCLUDED."description"),
                "updatedAt" = NOW()
            `;
          }

          // Donation'ları güncelle (campaignId -> projectId)
          await prisma.$executeRaw`
            UPDATE "Donation"
            SET "projectId" = ${campaign.projectId}
            WHERE "campaignId" = ${campaign.id}
          `;

          // RecurringDonation'ları güncelle
          await prisma.$executeRaw`
            UPDATE "RecurringDonation"
            SET "projectId" = ${campaign.projectId}
            WHERE "campaignId" = ${campaign.id}
          `;

          // CartItem'ları güncelle
          await prisma.$executeRaw`
            UPDATE "CartItem"
            SET "projectId" = ${campaign.projectId}
            WHERE "campaignId" = ${campaign.id}
          `;

        } else {
          // Eğer campaign'in projesi yoksa, yeni bir proje oluştur
          console.log(`   ✓ Yeni proje oluşturuluyor...`);

          // Yeni proje oluştur
          const newProject = await prisma.$queryRaw`
            INSERT INTO "Project" (
              "coverImage", "category", "status", "priority",
              "startDate", "endDate",
              "targetAmount", "collectedAmount", "donorCount", "beneficiaryCount",
              "isActive", "isFeatured", "displayOrder",
              "createdAt", "updatedAt"
            )
            VALUES (
              ${campaign.imageUrl}, ${campaign.category}, 'active', 'medium',
              ${campaign.startDate}, ${campaign.endDate},
              ${campaign.targetAmount}, ${campaign.collectedAmount || 0},
              ${campaign.donorCount || 0}, ${campaign.beneficiaryCount || 0},
              ${campaign.isActive}, ${campaign.isFeatured}, ${campaign.displayOrder},
              ${campaign.createdAt}, NOW()
            )
            RETURNING id
          `;

          const newProjectId = newProject[0].id;
          console.log(`   ✓ Yeni proje oluşturuldu (ID: ${newProjectId})`);

          // Campaign translations'ları project translations olarak ekle
          const campaignTranslations = await prisma.$queryRaw`
            SELECT * FROM "CampaignTranslation" WHERE "campaignId" = ${campaign.id}
          `;

          for (const trans of campaignTranslations) {
            await prisma.$executeRaw`
              INSERT INTO "ProjectTranslation" ("projectId", "language", "title", "slug", "description", "createdAt", "updatedAt")
              VALUES (${newProjectId}, ${trans.language}, ${trans.title}, ${trans.slug}, ${trans.description}, NOW(), NOW())
            `;
          }

          // Donation'ları güncelle
          await prisma.$executeRaw`
            UPDATE "Donation"
            SET "projectId" = ${newProjectId}
            WHERE "campaignId" = ${campaign.id}
          `;

          // RecurringDonation'ları güncelle
          await prisma.$executeRaw`
            UPDATE "RecurringDonation"
            SET "projectId" = ${newProjectId}
            WHERE "campaignId" = ${campaign.id}
          `;

          // CartItem'ları güncelle
          await prisma.$executeRaw`
            UPDATE "CartItem"
            SET "projectId" = ${newProjectId}
            WHERE "campaignId" = ${campaign.id}
          `;

          // CampaignSettings'i ProjectSettings'e dönüştür (varsa)
          const campaignSettings = await prisma.$queryRaw`
            SELECT * FROM "CampaignSettings" WHERE "campaignId" = ${campaign.id}
          `;

          if (campaignSettings.length > 0) {
            const settings = campaignSettings[0];
            await prisma.$executeRaw`
              INSERT INTO "ProjectSettings" (
                "projectId", "presetAmounts", "minAmount", "maxAmount",
                "allowRepeat", "minRepeatCount", "maxRepeatCount",
                "allowOneTime", "allowRecurring", "allowedFrequencies",
                "allowDedication", "allowAnonymous", "requireMessage",
                "isSacrifice", "sacrificeConfig",
                "showProgress", "showDonorCount", "showBeneficiaries",
                "impactMetrics", "successStories", "customCss", "customJs",
                "createdAt", "updatedAt"
              )
              VALUES (
                ${newProjectId}, ${settings.presetAmounts}, ${settings.minAmount}, ${settings.maxAmount},
                ${settings.allowRepeat}, ${settings.minRepeatCount}, ${settings.maxRepeatCount},
                ${settings.allowOneTime}, ${settings.allowRecurring}, ${settings.allowedFrequencies},
                ${settings.allowDedication}, ${settings.allowAnonymous}, ${settings.requireMessage},
                ${settings.isSacrifice}, ${settings.sacrificeConfig},
                ${settings.showProgress}, ${settings.showDonorCount}, ${settings.showBeneficiaries},
                ${settings.impactMetrics}, ${settings.successStories}, ${settings.customCss}, ${settings.customJs},
                NOW(), NOW()
              )
            `;
          }
        }

        successCount++;
        console.log(`   ✅ Campaign ID ${campaign.id} başarıyla migrate edildi.`);

      } catch (error) {
        errorCount++;
        console.error(`   ❌ Campaign ID ${campaign.id} için hata:`, error.message);
      }
    }

    console.log('\n========================================================');
    console.log(`✅ Migration tamamlandı!`);
    console.log(`   Başarılı: ${successCount}`);
    console.log(`   Hatalı: ${errorCount}`);
    console.log('========================================================\n');

    if (errorCount === 0) {
      console.log('🗑️  Artık DonationCampaign ve CampaignTranslation tablolarını silebilirsiniz.');
      console.log('   NOT: Migration tamamlandıktan sonra schema migration çalıştırın:');
      console.log('   npx prisma migrate dev --name remove-donation-campaign');
    }

  } catch (error) {
    console.error('❌ Migration hatası:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
