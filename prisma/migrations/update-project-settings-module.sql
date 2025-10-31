-- Migration: Update campaign-settings to project-settings and move under projects module
-- Date: 2025-10-31

-- 1. Update campaign-settings modülünü project-settings olarak güncelle
UPDATE "AdminModule"
SET
  name = 'Proje Ayarları',
  "moduleKey" = 'project-settings',
  path = '/admin/project-settings',
  "parentId" = 4, -- projects modülünün ID'si
  "displayOrder" = 1
WHERE "moduleKey" = 'campaign-settings';

-- 2. Yeni project-settings alt modülünü ekle (Toplu Güncelleme)
INSERT INTO "AdminModule" (name, "moduleKey", path, icon, "displayOrder", "parentId")
VALUES (
  'Toplu Ayar Güncelleme',
  'project-settings-bulk',
  '/admin/project-settings/bulk-update',
  NULL,
  2,
  4 -- projects modülünün altında
)
ON CONFLICT ("moduleKey") DO NOTHING;

-- 3. campaigns modülünü kaldır (veya pasif et)
-- Eğer tamamen kaldırmak istersek:
DELETE FROM "RoleModulePermission" WHERE "moduleId" = (SELECT id FROM "AdminModule" WHERE "moduleKey" = 'campaigns');
DELETE FROM "AdminModule" WHERE "moduleKey" = 'campaigns';

-- 4. Tüm rollere project-settings için varsayılan izinler ekle
-- SuperAdmin rolüne tüm yetkiler
INSERT INTO "RoleModulePermission" ("roleId", "moduleId", permissions)
SELECT
  r.id,
  m.id,
  '{"read": true, "create": true, "update": true, "delete": true}'::json
FROM "Role" r
CROSS JOIN "AdminModule" m
WHERE r.name = 'SuperAdmin'
  AND m."moduleKey" = 'project-settings'
ON CONFLICT ("roleId", "moduleId")
DO UPDATE SET permissions = '{"read": true, "create": true, "update": true, "delete": true}'::json;

-- Diğer rollere read ve update yetkisi (örnekleme - gerekirse düzenleyin)
INSERT INTO "RoleModulePermission" ("roleId", "moduleId", permissions)
SELECT
  r.id,
  m.id,
  '{"read": true, "create": false, "update": true, "delete": false}'::json
FROM "Role" r
CROSS JOIN "AdminModule" m
WHERE r.name != 'SuperAdmin'
  AND m."moduleKey" = 'project-settings'
ON CONFLICT ("roleId", "moduleId")
DO UPDATE SET permissions = '{"read": true, "create": false, "update": true, "delete": false}'::json;

-- 5. Toplu güncelleme modülü için de izinler ekle
INSERT INTO "RoleModulePermission" ("roleId", "moduleId", permissions)
SELECT
  r.id,
  m.id,
  '{"read": true, "create": false, "update": true, "delete": false}'::json
FROM "Role" r
CROSS JOIN "AdminModule" m
WHERE r.name = 'SuperAdmin'
  AND m."moduleKey" = 'project-settings-bulk'
ON CONFLICT ("roleId", "moduleId")
DO UPDATE SET permissions = '{"read": true, "create": false, "update": true, "delete": false}'::json;

-- Sonuçları kontrol et
SELECT id, name, "moduleKey", path, "parentId", "displayOrder"
FROM "AdminModule"
WHERE "moduleKey" IN ('project-settings', 'project-settings-bulk', 'projects')
ORDER BY "parentId" NULLS FIRST, "displayOrder";
