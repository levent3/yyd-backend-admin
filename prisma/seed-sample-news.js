const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("📰 Örnek haberler ekleniyor...\n");

    // Admin kullanıcısını bul
    const adminUser = await prisma.user.findUnique({
        where: { email: "admin@yyd.com" },
    });

    if (!adminUser) {
        console.error("❌ Admin kullanıcısı bulunamadı!");
        return;
    }

    const news = [
        {
            status: "published",
            publishedAt: new Date(),
            authorId: adminUser.id,
            translations: {
                create: [
                    {
                        language: "tr",
                        title: "Göz Sağlığı Projemiz Başarıyla Tamamlandı",
                        slug: "goz-sagligi-projemiz-basariyla-tamamlandi",
                        summary:
                            "500 kişiye katarakt ameliyatı desteği sağlandı",
                        content:
                            "<p>Göz sağlığı projemiz kapsamında 500 ihtiyaç sahibi vatandaşımıza katarakt ameliyatı desteği sağladık. Proje 6 ay sürdü ve başarıyla tamamlandı.</p><p>Projemiz sayesinde birçok vatandaşımız tekrar görebilmenin mutluluğunu yaşadı.</p>",
                    },
                    {
                        language: "en",
                        title: "Our Eye Health Project Successfully Completed",
                        slug: "our-eye-health-project-successfully-completed",
                        summary:
                            "Cataract surgery support provided to 500 people",
                        content:
                            "<p>Within the scope of our eye health project, we provided cataract surgery support to 500 citizens in need. The project lasted 6 months and was successfully completed.</p><p>Thanks to our project, many of our citizens experienced the happiness of being able to see again.</p>",
                    },
                ],
            },
        },
        {
            status: "published",
            publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 gün önce
            authorId: adminUser.id,
            translations: {
                create: [
                    {
                        language: "tr",
                        title: "Afrika'da Yeni Su Kuyuları Açıldı",
                        slug: "afrikada-yeni-su-kuyulari-acildi",
                        summary:
                            "Kenya'da 3 yeni temiz su kuyusu hizmete girdi",
                        content:
                            "<p>Afrika'daki temiz su projemiz kapsamında Kenya'da 3 yeni kuyu açtık. Bu kuyular sayesinde 1000'den fazla kişi temiz suya erişim sağlayacak.</p>",
                    },
                    {
                        language: "en",
                        title: "New Water Wells Opened in Africa",
                        slug: "new-water-wells-opened-in-africa",
                        summary:
                            "3 new clean water wells put into service in Kenya",
                        content:
                            "<p>Within the scope of our clean water project in Africa, we opened 3 new wells in Kenya. Thanks to these wells, more than 1000 people will have access to clean water.</p>",
                    },
                ],
            },
        },
        {
            status: "published",
            publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 gün önce
            authorId: adminUser.id,
            translations: {
                create: [
                    {
                        language: "tr",
                        title: "Ramazan Ayında 500 Aileye Gıda Kolisi Dağıtıldı",
                        slug: "ramazan-ayinda-500-aileye-gida-kolisi-dagitildi",
                        summary:
                            "İhtiyaç sahibi ailelere gıda desteği sağlandı",
                        content:
                            "<p>Ramazan ayı münasebetiyle 500 ihtiyaç sahibi aileye gıda kolisi dağıttık. Her kolide temel gıda maddeleri bulunuyor.</p>",
                    },
                    {
                        language: "en",
                        title: "Food Packages Distributed to 500 Families During Ramadan",
                        slug: "food-packages-distributed-to-500-families-during-ramadan",
                        summary: "Food support provided to families in need",
                        content:
                            "<p>On the occasion of Ramadan, we distributed food packages to 500 families in need. Each package contains basic food items.</p>",
                    },
                ],
            },
        },
        {
            status: "published",
            publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 hafta önce
            authorId: adminUser.id,
            translations: {
                create: [
                    {
                        language: "tr",
                        title: "Eğitim Projemiz ile 200 Öğrenciye Burs Desteği",
                        slug: "egitim-projemiz-ile-200-ogrenciye-burs-destegi",
                        summary: "Başarılı öğrencilere eğitim bursu verildi",
                        content:
                            "<p>Eğitim projemiz kapsamında 200 başarılı ancak maddi imkanları kısıtlı öğrenciye burs desteği sağladık. Öğrenciler eğitimlerine devam edebilecek.</p>",
                    },
                    {
                        language: "en",
                        title: "Scholarship Support to 200 Students with Our Education Project",
                        slug: "scholarship-support-to-200-students-with-our-education-project",
                        summary:
                            "Educational scholarships given to successful students",
                        content:
                            "<p>Within the scope of our education project, we provided scholarship support to 200 successful students with limited financial means. Students will be able to continue their education.</p>",
                    },
                ],
            },
        },
    ];

    let createdCount = 0;

    for (const newsData of news) {
        try {
            const newsItem = await prisma.news.create({
                data: newsData,
                include: {
                    translations: true,
                },
            });

            console.log(`✅ Eklendi: ${newsItem.translations[0].title}`);
            createdCount++;
        } catch (error) {
            console.error(`❌ Hata:`, error.message);
        }
    }

    console.log(`\n✨ Tamamlandı! ${createdCount} haber eklendi.\n`);
}

main()
    .catch((e) => {
        console.error("❌ Seed hatası:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
