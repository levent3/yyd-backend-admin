-- Add Media Management modules to AdminModule table
-- Parent module: Media Management (ID: 23)
-- Child modules: Brand Assets (24), Brochures (25), Public Spots (26), Success Stories (27), Media Coverage (28)

-- Insert Media Management parent module
INSERT INTO "AdminModule" (id, name, "moduleKey", path, icon, "displayOrder", "parentId")
VALUES (23, 'Medya Yönetimi', 'media', NULL, 'folder', 16, NULL);

-- Insert Brand Assets module
INSERT INTO "AdminModule" (id, name, "moduleKey", path, icon, "displayOrder", "parentId")
VALUES (24, 'Kurumsal Kimlik', 'brand-assets', '/admin/brand-assets', 'award', 1, 23);

-- Insert Brochures module
INSERT INTO "AdminModule" (id, name, "moduleKey", path, icon, "displayOrder", "parentId")
VALUES (25, 'Broşürler', 'brochures', '/admin/brochures', 'file-text', 2, 23);

-- Insert Public Spots module
INSERT INTO "AdminModule" (id, name, "moduleKey", path, icon, "displayOrder", "parentId")
VALUES (26, 'Tanıtım Videoları', 'public-spots', '/admin/public-spots', 'video', 3, 23);

-- Insert Success Stories module
INSERT INTO "AdminModule" (id, name, "moduleKey", path, icon, "displayOrder", "parentId")
VALUES (27, 'Başarı Hikayeleri', 'success-stories', '/admin/success-stories', 'star', 4, 23);

-- Insert Media Coverage module
INSERT INTO "AdminModule" (id, name, "moduleKey", path, icon, "displayOrder", "parentId")
VALUES (28, 'Basında Biz', 'media-coverage', '/admin/media-coverage', 'tv', 5, 23);

-- Grant full permissions to superadmin role (roleId: 1) for all new media modules
INSERT INTO "RoleModulePermission" ("roleId", "moduleId", permissions) VALUES
(1, 23, '{"read": true, "create": true, "delete": true, "update": true}'),
(1, 24, '{"read": true, "create": true, "delete": true, "update": true}'),
(1, 25, '{"read": true, "create": true, "delete": true, "update": true}'),
(1, 26, '{"read": true, "create": true, "delete": true, "update": true}'),
(1, 27, '{"read": true, "create": true, "delete": true, "update": true}'),
(1, 28, '{"read": true, "create": true, "delete": true, "update": true}');

-- Grant read-only permissions to editor role (roleId: 2) for all new media modules
INSERT INTO "RoleModulePermission" ("roleId", "moduleId", permissions) VALUES
(2, 23, '{"read": true, "create": false, "delete": false, "update": false}'),
(2, 24, '{"read": true, "create": false, "delete": false, "update": false}'),
(2, 25, '{"read": true, "create": false, "delete": false, "update": false}'),
(2, 26, '{"read": true, "create": false, "delete": false, "update": false}'),
(2, 27, '{"read": true, "create": false, "delete": false, "update": false}'),
(2, 28, '{"read": true, "create": false, "delete": false, "update": false}');

-- Update sequence for AdminModule
SELECT setval('"AdminModule_id_seq"', 28, true);
