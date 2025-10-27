-- Önce Module kaydını ekleyelim
INSERT INTO "Module" (name, slug, description, icon, "displayOrder", "isActive", category, "parentId")
VALUES (
    'Açık Pozisyonlar',
    'job-positions',
    'Kariyer sayfasında gösterilen açık iş pozisyonlarının yönetimi',
    'briefcase',
    4,
    true,
    'Başvuru Yönetimi',
    NULL
)
ON CONFLICT (slug) DO NOTHING;

-- Module ID'yi alalım ve permissions ekleyelim
DO $$
DECLARE
    module_id INTEGER;
BEGIN
    SELECT id INTO module_id FROM "Module" WHERE slug = 'job-positions';

    -- Super Admin rolüne tüm yetkiler
    INSERT INTO "ModulePermission" ("roleId", "moduleId", "canView", "canCreate", "canEdit", "canDelete")
    SELECT 1, module_id, true, true, true, true
    WHERE NOT EXISTS (
        SELECT 1 FROM "ModulePermission" WHERE "roleId" = 1 AND "moduleId" = module_id
    );

    -- Admin rolüne tam yetki
    INSERT INTO "ModulePermission" ("roleId", "moduleId", "canView", "canCreate", "canEdit", "canDelete")
    SELECT 2, module_id, true, true, true, true
    WHERE NOT EXISTS (
        SELECT 1 FROM "ModulePermission" WHERE "roleId" = 2 AND "moduleId" = module_id
    );

    -- Editor rolüne düzenleme yetkisi
    INSERT INTO "ModulePermission" ("roleId", "moduleId", "canView", "canCreate", "canEdit", "canDelete")
    SELECT 3, module_id, true, true, true, false
    WHERE NOT EXISTS (
        SELECT 1 FROM "ModulePermission" WHERE "roleId" = 3 AND "moduleId" = module_id
    );
END $$;

-- Açık İş Pozisyonları (Website'deki pozisyonlar)

INSERT INTO "JobPosition" (title, slug, description, requirements, responsibilities, qualifications, department, location, "employmentType", "isActive", "isFeatured", "displayOrder", "updatedAt") VALUES
(
    'Full-Stack Developer',
    'full-stack-developer',
    'Yeryüzü Doktorları olarak geliştirdiğimiz web uygulamaları ve sistemlerin tasarımı, geliştirilmesi ve bakımı için ekibimize katılacak deneyimli bir Full-Stack Developer arıyoruz.',
    E'- En az 3 yıl profesyonel yazılım geliştirme deneyimi\n- Node.js, React.js/Next.js konusunda ileri seviye bilgi\n- PostgreSQL veya benzeri veritabanı yönetim sistemleri deneyimi\n- RESTful API tasarımı ve geliştirme deneyimi\n- Git versiyon kontrol sistemi kullanımı\n- Agile/Scrum metodolojileri hakkında bilgi',
    E'- Web uygulamalarının frontend ve backend geliştirmesi\n- Veritabanı tasarımı ve optimizasyonu\n- API entegrasyonları\n- Kod kalitesi ve güvenlik standartlarının sağlanması\n- Ekip üyeleri ile işbirliği içinde çalışma',
    E'- Bilgisayar Mühendisliği, Yazılım Mühendisliği veya ilgili alanlarda lisans derecesi\n- Problem çözme ve analitik düşünme becerileri\n- İngilizce bilgisi (teknik dokümantasyon okuyabilme)',
    'Teknoloji',
    'İstanbul (Hibrit)',
    'Tam Zamanlı',
    true,
    true,
    1,
    NOW()
),
(
    'Basın, Yayın & PR Yetkilisi',
    'basin-yayin-pr-yetkilisi',
    'İletişim stratejilerimizi yönetecek, kurumsal iletişim faaliyetlerimizi koordine edecek dinamik bir Basın, Yayın & PR Yetkilisi arıyoruz.',
    E'- İletişim, Halkla İlişkiler, Gazetecilik veya ilgili alanlarda lisans derecesi\n- En az 2 yıl PR, medya ilişkileri veya kurumsal iletişim deneyimi\n- Mükemmel yazılı ve sözlü iletişim becerileri\n- Sosyal medya yönetimi konusunda deneyim\n- Basın bülteni hazırlama ve medya takibi deneyimi',
    E'- Kurumsal iletişim stratejilerinin geliştirilmesi ve uygulanması\n- Basın bültenleri ve basın kitleri hazırlanması\n- Medya ilişkilerinin yönetimi\n- Sosyal medya içerik stratejisinin oluşturulması\n- Etkinlik ve basın toplantılarının organizasyonu',
    E'- PR araçları ve yazılımlarına hakim\n- Kriz iletişimi deneyimi (tercihen)\n- Detaylara özen gösteren ve organize',
    'İletişim',
    'İstanbul',
    'Tam Zamanlı',
    true,
    false,
    2,
    NOW()
),
(
    'Project Assistant',
    'project-assistant',
    'Saha projelerimizin koordinasyonunda görev alacak, proje ekiplerine destek sağlayacak bir Proje Asistanı arıyoruz.',
    E'- Üniversitelerin ilgili bölümlerinden mezun\n- Tercihen proje koordinasyonu veya NGO deneyimi\n- İleri seviye MS Office bilgisi\n- İngilizce bilgisi (yazılı ve sözlü)\n- Analitik düşünme ve problem çözme becerileri',
    E'- Proje raporlarının hazırlanması\n- Saha ekipleri ile koordinasyon\n- Proje dökümanlarının takibi\n- Toplantı ve etkinlik organizasyonlarında destek\n- İdari işlerin yürütülmesi',
    E'- Çok görevli ortamda çalışabilme yeteneği\n- Ekip çalışmasına yatkınlık\n- Uluslararası proje deneyimi (tercihen)',
    'Proje Yönetimi',
    'İstanbul',
    'Tam Zamanlı',
    true,
    false,
    3,
    NOW()
),
(
    'Videographer',
    'videographer',
    'Projelerimizi ve faaliyetlerimizi görsel olarak belgeleyecek, hikayelerimizi anlatacak yetenekli bir Videographer arıyoruz.',
    E'- Video prodüksiyon alanında en az 2 yıl deneyim\n- Adobe Premiere, After Effects veya benzeri programlarda uzman seviye bilgi\n- Kamera ekipmanları ve çekim teknikleri konusunda ileri seviye bilgi\n- Drone çekimi deneyimi (artı)\n- Saha çalışmalarına katılabilme esnekliği',
    E'- Kurumsal video çekimleri ve prodüksiyonu\n- Saha çalışmalarının belgelenmesi\n- Video montaj ve post-prodüksiyon\n- Sosyal medya için video içerik üretimi\n- Video arşivinin yönetimi',
    E'- Hikaye anlatımı konusunda yaratıcı bakış açısı\n- Zor koşullarda çalışabilme yeteneği\n- Portföy sunabilme',
    'Medya',
    'İstanbul / Saha',
    'Tam Zamanlı',
    true,
    false,
    4,
    NOW()
),
(
    'Capacity Development Specialist',
    'capacity-development-specialist',
    'Organizasyonumuzun ve ortaklarımızın kapasitelerini güçlendirecek, eğitim programlarını tasarlayıp uygulayacak bir Kapasite Geliştirme Uzmanı arıyoruz.',
    E'- Sosyal Bilimler, Uluslararası İlişkiler veya ilgili alanlarda yüksek lisans derecesi\n- En az 3 yıl NGO veya uluslararası kuruluşlarda kapasite geliştirme deneyimi\n- Eğitim programı tasarlama ve uygulama deneyimi\n- İngilizce ileri seviye (C1)\n- Arapça bilgisi (artı)',
    E'- Kapasite geliştirme stratejilerinin oluşturulması\n- Eğitim programlarının tasarlanması ve uygulanması\n- İhtiyaç analizi çalışmalarının yürütülmesi\n- Mentorluk ve koçluk faaliyetleri\n- Etki değerlendirme raporlarının hazırlanması',
    E'- Yetişkin eğitimi metodolojilerine hakim\n- Saha çalışmalarına katılabilme esnekliği\n- Kültürlerarası çalışma deneyimi',
    'Eğitim',
    'İstanbul / Saha',
    'Tam Zamanlı',
    true,
    false,
    5,
    NOW()
),
(
    'Sekreter',
    'sekreter',
    'Ofis yönetimi ve idari işlerde destek sağlayacak, organizasyon becerilerine sahip bir Sekreter arıyoruz.',
    E'- Lise veya üniversite mezunu\n- En az 1 yıl sekreterlik veya ofis yönetimi deneyimi\n- MS Office programlarına hakim\n- Mükemmel iletişim becerileri\n- Detaylara önem veren, organize',
    E'- Gelen-giden evrak işlemleri\n- Telefon ve e-posta yönetimi\n- Toplantı ve seyahat organizasyonu\n- Ziyaretçi kabul ve yönlendirme\n- Ofis malzemeleri ve envanter takibi',
    E'- Güler yüzlü ve profesyonel yaklaşım\n- Multitasking yeteneği\n- Gizlilik prensiplerine bağlı çalışma',
    'İdari İşler',
    'İstanbul',
    'Tam Zamanlı',
    true,
    false,
    6,
    NOW()
);
