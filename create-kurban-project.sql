-- Nafile Kurban Bağışı Projesi Oluşturma Script'i
-- Tarih: 2025-01-12

BEGIN;

-- 1. Project oluştur
INSERT INTO "Project" (
  "imageUrl",
  "coverImage",
  "isActive",
  "isFeatured",
  "category",
  "status",
  "priority",
  "targetAmount",
  "collectedAmount",
  "budget",
  "beneficiaryCount",
  "donorCount",
  "displayOrder",
  "country",
  "location",
  "shortCode",
  "startDate",
  "endDate",
  "createdAt",
  "updatedAt"
) VALUES (
  '/images/kurban-default.jpg',
  '/images/kurban-cover.jpg',
  true,
  true,
  'Kurban',
  'active',
  'high',
  280000.00,  -- 70 kurban x 4000 TL = 280,000 TL hedef
  0.00,
  280000.00,
  490,  -- 70 kurban x 7 hisse = 490 faydalanıcı
  0,
  1,  -- En üstte göster
  'Türkiye',
  'Türkiye Geneli',
  'kurban-2025',
  NOW(),
  '2025-07-15 23:59:59',  -- Kurban Bayramı öncesi
  NOW(),
  NOW()
)
RETURNING id;

-- 2. ProjectTranslation ekle (Türkçe)
INSERT INTO "ProjectTranslation" (
  "projectId",
  "language",
  "title",
  "slug",
  "description",
  "content",
  "createdAt",
  "updatedAt"
) VALUES (
  (SELECT id FROM "Project" WHERE "shortCode" = 'kurban-2025'),
  'tr',
  'Nafile Kurban Bağışı',
  'nafile-kurban-bagisi',
  'Kurban Bayramı için nafile kurban bağışı yaparak sevabına ortak olun. Her kurban 7 hisseye bölünerek ihtiyaç sahiplerine ulaştırılır.',
  '<h2>Nafile Kurban Bağışı Hakkında</h2>
<p>Kurban Bayramı, İslam dininde büyük bir öneme sahip olan mübarek günlerdendir. Bu özel günlerde yapılan kurban ibadeti, Allah rızasını kazanmanın ve ihtiyaç sahiplerine yardım etmenin güzel bir yoludur.</p>

<h3>Kurban Bağışınızın Özellikleri:</h3>
<ul>
  <li><strong>7 Hisse Sistemi:</strong> Her kurban 7 hisseye bölünür, dilediğiniz kadar hisse alabilirsiniz</li>
  <li><strong>Hissedar Belirleme:</strong> Her hisse için ayrı hissedar (kendiniz, aileniz, yakınlarınız) belirleyebilirsiniz</li>
  <li><strong>Güvenilir Kesim:</strong> Kurbanlar, yetkili ekiplerimiz tarafından sağlık ve hijyen kurallarına uygun olarak kesilir</li>
  <li><strong>İhtiyaç Sahiplerine Ulaşım:</strong> Kesilen kurbanlar, ihtiyaç sahibi ailelere titizlikle dağıtılır</li>
  <li><strong>Raporlama:</strong> Bağışçılarımıza kurban kesimi ve dağıtımı hakkında detaylı raporlar sunulur</li>
</ul>

<h3>Hisse Başı Fiyat:</h3>
<p><strong>4.000 TL</strong> / Hisse</p>
<p>Tam kurban (7 hisse): 28.000 TL</p>

<h3>Neden Kurban Bağışı Yapmalıyım?</h3>
<ul>
  <li>Allah rızasını kazanmak</li>
  <li>İhtiyaç sahiplerine yardım etmek</li>
  <li>Kurban ibadetini yerine getirmek</li>
  <li>Sevdikleriniz adına sevap kazanmak</li>
  <li>Toplumsal dayanışmaya katkıda bulunmak</li>
</ul>

<h3>Nasıl Bağış Yapabilirim?</h3>
<ol>
  <li>Almak istediğiniz hisse sayısını belirleyin (1-7 arası)</li>
  <li>Her hisse için hissedar bilgilerini girin</li>
  <li>Ödeme bilgilerinizi girin</li>
  <li>Güvenli ödeme ile işleminizi tamamlayın</li>
  <li>E-posta ile onay alın</li>
</ol>

<h3>Önemli Tarihler:</h3>
<ul>
  <li><strong>Son Başvuru:</strong> 15 Temmuz 2025</li>
  <li><strong>Kesim Tarihi:</strong> Kurban Bayramı (16-19 Temmuz 2025)</li>
  <li><strong>Dağıtım:</strong> Bayram süresince</li>
</ul>

<p><em>"Kim bir iyilik yaparsa, ona on misli verilir." (En\'am Suresi, 160. Ayet)</em></p>',
  NOW(),
  NOW()
);

-- 3. ProjectSettings ekle (Kurban özel ayarlar)
INSERT INTO "ProjectSettings" (
  "projectId",
  "presetAmounts",
  "minAmount",
  "maxAmount",
  "allowRepeat",
  "minRepeatCount",
  "maxRepeatCount",
  "allowOneTime",
  "allowRecurring",
  "allowedFrequencies",
  "allowDedication",
  "allowAnonymous",
  "requireMessage",
  "isSacrifice",
  "sacrificeConfig",
  "showProgress",
  "showDonorCount",
  "showBeneficiaries",
  "impactMetrics",
  "createdAt",
  "updatedAt"
) VALUES (
  (SELECT id FROM "Project" WHERE "shortCode" = 'kurban-2025'),
  '[4000, 8000, 12000, 16000, 28000]'::jsonb,  -- 1, 2, 3, 4, 7 hisse
  4000.00,   -- Minimum 1 hisse
  28000.00,  -- Maximum 7 hisse
  false,     -- Tekrar yok (kurban tek seferlik)
  1,
  1,
  true,      -- Tek seferlik ödeme
  false,     -- Düzenli ödeme YOK (kurban tek seferlik)
  '[]'::jsonb,
  true,      -- Adanmış bağış (hissedarlar için)
  true,      -- Anonim olabilir
  false,     -- Mesaj zorunlu değil
  true,      -- KURBAN BAĞIŞI!
  '{
    "sharePrice": 4000,
    "totalShares": 7,
    "sacrificeType": "nafile",
    "allowPartialShares": true,
    "requireShareholderInfo": false,
    "cutDate": "2025-07-16",
    "distributionDates": ["2025-07-16", "2025-07-17", "2025-07-18", "2025-07-19"]
  }'::jsonb,
  true,      -- İlerlemeyi göster
  true,      -- Bağışçı sayısını göster
  true,      -- Faydalanıcı sayısını göster
  '[
    {
      "icon": "users",
      "label": "Faydalanıcı Aile",
      "value": "70+",
      "description": "İhtiyaç sahibi aileye ulaşacak"
    },
    {
      "icon": "heart",
      "label": "Kurban Sayısı",
      "value": "70",
      "description": "Kurban kesilecek"
    },
    {
      "icon": "calendar",
      "label": "Kesim Tarihi",
      "value": "16-19 Temmuz",
      "description": "Kurban Bayramı"
    }
  ]'::jsonb,
  NOW(),
  NOW()
);

COMMIT;

-- Kontrol sorgusu
SELECT
  p.id,
  p."shortCode",
  p."isActive",
  p."isFeatured",
  p."targetAmount",
  p."category",
  pt."title",
  pt."slug",
  ps."isSacrifice",
  ps."sacrificeConfig"
FROM "Project" p
LEFT JOIN "ProjectTranslation" pt ON p.id = pt."projectId" AND pt."language" = 'tr'
LEFT JOIN "ProjectSettings" ps ON p.id = ps."projectId"
WHERE p."shortCode" = 'kurban-2025';
