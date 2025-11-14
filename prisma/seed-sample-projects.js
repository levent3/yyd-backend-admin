const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Örnek projeler ekleniyor...\n");

    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
        where: { email: "admin@yyd.com" },
    });

    if (!adminUser) {
        console.error("❌ Admin kullanıcısı bulunamadı!");
        return;
    }

    // Faaliyet alanlarını bul
    const activityAreas = await prisma.activityArea.findMany();

    if (activityAreas.length === 0) {
        console.warn(
            "⚠️  Faaliyet alanı bulunamadı. Önce seed-activity-areas.js çalıştırın."
        );
    }

    const projects = [
        {
            shortCode: "SAGLIK001",
            category: "Sağlık",
            status: "active",
            isActive: true,
            isFeatured: true,
            priority: "high",
            targetAmount: 100000,
            collectedAmount: 45000,
            donorCount: 120,
            beneficiaryCount: 500,
            country: "Türkiye",
            location: "İstanbul",
            displayOrder: 1,
            authorId: adminUser.id,
            translations: {
                create: [
                    {
                        language: "tr",
                        title: "Göz Sağlığı Projesi",
                        description:
                            "Katarakt ameliyatı için yardım kampanyası",
                        content:
                            "<p>Göz sağlığı projemiz kapsamında ihtiyaç sahibi vatandaşlarımıza katarakt ameliyatı desteği sağlıyoruz.</p>",
                        slug: "goz-sagligi-projesi",
                    },
                    {
                        language: "en",
                        title: "Eye Health Project",
                        description: "Cataract surgery aid campaign",
                        content:
                            "<p>Within the scope of our eye health project, we provide cataract surgery support to our citizens in need.</p>",
                        slug: "eye-health-project",
                    },
                ],
            },
        },
        {
            shortCode: "EGITIM001",
            category: "Eğitim",
            status: "active",
            isActive: true,
            isFeatured: true,
            priority: "high",
            targetAmount: 75000,
            collectedAmount: 30000,
            donorCount: 85,
            beneficiaryCount: 200,
            country: "Türkiye",
            location: "Ankara",
            displayOrder: 2,
            authorId: adminUser.id,
            translations: {
                create: [
                    {
                        language: "tr",
                        title: "Eğitim Desteği Projesi",
                        description: "Öğrencilere burs ve kırtasiye yardımı",
                        content:
                            "<p>Eğitim projemiz ile ihtiyaç sahibi öğrencilere burs ve kırtasiye desteği sağlıyoruz.</p>",
                        slug: "egitim-destegi-projesi",
                    },
                    {
                        language: "en",
                        title: "Education Support Project",
                        description:
                            "Scholarship and stationery aid for students",
                        content:
                            "<p>With our education project, we provide scholarship and stationery support to students in need.</p>",
                        slug: "education-support-project",
                    },
                ],
            },
        },
        {
            shortCode: "SU001",
            category: "Su",
            status: "active",
            isActive: true,
            isFeatured: false,
            priority: "medium",
            targetAmount: 50000,
            collectedAmount: 15000,
            donorCount: 45,
            beneficiaryCount: 1000,
            country: "Afrika",
            location: "Kenya",
            displayOrder: 3,
            authorId: adminUser.id,
            translations: {
                create: [
                    {
                        language: "tr",
                        title: "Temiz Su Kuyusu Projesi",
                        description: "Afrika'da temiz su kuyusu açma projesi",
                        content:
                            "<p>Afrika'daki köylerde temiz su kuyuları açarak binlerce insana temiz suya erişim imkanı sağlıyoruz.</p>",
                        slug: "temiz-su-kuyusu-projesi",
                    },
                    {
                        language: "en",
                        title: "Clean Water Well Project",
                        description: "Clean water well project in Africa",
                        content:
                            "<p>By opening clean water wells in African villages, we provide thousands of people with access to clean water.</p>",
                        slug: "clean-water-well-project",
                    },
                ],
            },
        },
        {
            shortCode: "GIDA001",
            category: "Gıda",
            status: "active",
            isActive: true,
            isFeatured: true,
            priority: "high",
            targetAmount: 120000,
            collectedAmount: 80000,
            donorCount: 250,
            beneficiaryCount: 800,
            country: "Türkiye",
            location: "Çeşitli İller",
            displayOrder: 4,
            authorId: adminUser.id,
            translations: {
                create: [
                    {
                        language: "tr",
                        title: "Gıda Yardımı Projesi",
                        description:
                            "İhtiyaç sahibi ailelere gıda kolisi desteği",
                        content:
                            "<p>Gıda yardımı projemiz ile ihtiyaç sahibi ailelere düzenli olarak gıda kolisi ulaştırıyoruz.</p>",
                        slug: "gida-yardimi-projesi",
                    },
                    {
                        language: "en",
                        title: "Food Aid Project",
                        description:
                            "Food package support for families in need",
                        content:
                            "<p>With our food aid project, we regularly deliver food packages to families in need.</p>",
                        slug: "food-aid-project",
                    },
                ],
            },
        },
        {
            shortCode: "KURBAN001",
            category: "Kurban",
            status: "active",
            isActive: true,
            isFeatured: false,
            priority: "medium",
            targetAmount: 200000,
            collectedAmount: 120000,
            donorCount: 180,
            beneficiaryCount: 1500,
            country: "Türkiye",
            location: "Çeşitli İller",
            displayOrder: 5,
            authorId: adminUser.id,
            translations: {
                create: [
                    {
                        language: "tr",
                        title: "Kurban Bağışı Projesi",
                        description: "Kurban kesimi ve et dağıtımı",
                        content:
                            "<p>Kurban bayramında kesilen kurbanların etleri ihtiyaç sahibi ailelere ulaştırılmaktadır.</p>",
                        slug: "kurban-bagisi-projesi",
                    },
                    {
                        language: "en",
                        title: "Qurban Donation Project",
                        description: "Qurban slaughter and meat distribution",
                        content:
                            "<p>The meat of the qurbans slaughtered during Eid al-Adha is delivered to families in need.</p>",
                        slug: "qurban-donation-project",
                    },
                ],
            },
        },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const projectData of projects) {
        try {
            // Aynı shortCode ile proje var mı kontrol et
            const existing = await prisma.project.findUnique({
                where: { shortCode: projectData.shortCode },
            });

            if (existing) {
                console.log(
                    `⏭️  Atlandı: ${projectData.shortCode} (zaten var)`
                );
                skippedCount++;
                continue;
            }

            const project = await prisma.project.create({
                data: projectData,
                include: {
                    translations: true,
                },
            });

            console.log(
                `✅ Eklendi: ${project.translations[0].title} (${project.shortCode})`
            );
            createdCount++;
        } catch (error) {
            console.error(`❌ Hata (${projectData.shortCode}):`, error.message);
        }
    }

    console.log(
        `\n✨ Tamamlandı! ${createdCount} proje eklendi, ${skippedCount} proje atlandı.\n`
    );
}

main()
    .catch((e) => {
        console.error("❌ Seed hatası:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
