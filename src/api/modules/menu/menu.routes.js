const express = require('express');
const router = express.Router();
const menuController = require('./menu.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Menu
 *     description: Menü yönetimi - Dinamik menü sistemi (header, footer vb.)
 *   - name: Menu Items
 *     description: Menü öğeleri yönetimi - Sayfa, proje linklerini ekleyip düzenleyin
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Menu:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *       properties:
 *         id:
 *           type: integer
 *           description: Menü ID
 *         name:
 *           type: string
 *           description: Menü adı
 *           example: Ana Menü
 *         slug:
 *           type: string
 *           description: Benzersiz slug (URL'de kullanılır)
 *           example: main-menu
 *         description:
 *           type: string
 *           description: Menü açıklaması
 *         location:
 *           type: string
 *           description: Menü konumu
 *           example: header
 *           enum: [header, footer, sidebar, mobile]
 *         isActive:
 *           type: boolean
 *           description: Menü aktif mi?
 *           default: true
 *
 *     MenuItem:
 *       type: object
 *       required:
 *         - menuId
 *         - title
 *         - linkType
 *       properties:
 *         id:
 *           type: integer
 *           description: Menü öğesi ID
 *         menuId:
 *           type: integer
 *           description: Hangi menüye ait?
 *         parentId:
 *           type: integer
 *           description: Üst menü öğesi ID (alt menü oluşturmak için)
 *           example: null
 *         title:
 *           type: string
 *           description: Menüde görünecek başlık
 *           example: Hakkımızda
 *         linkType:
 *           type: string
 *           enum: [page, project, news, activityArea, custom, external]
 *           description: |
 *             Link tipi:
 *             - page: Sayfa modülünden bir sayfa
 *             - project: Proje modülünden bir proje
 *             - news: Haber modülünden bir haber
 *             - activityArea: Faaliyet alanı
 *             - custom: Özel URL (sitede)
 *             - external: Dış link
 *         linkId:
 *           type: integer
 *           description: Bağlı içerik ID (page, project vb için gerekli)
 *           example: 5
 *         customUrl:
 *           type: string
 *           description: Özel URL (custom/external için gerekli)
 *           example: /bagis-yap
 *         icon:
 *           type: string
 *           description: İkon sınıfı (FontAwesome vb.)
 *           example: fa-home
 *         cssClass:
 *           type: string
 *           description: Özel CSS sınıfı
 *         target:
 *           type: string
 *           enum: [_self, _blank]
 *           default: _self
 *           description: Link nasıl açılsın? (_self=aynı sekme, _blank=yeni sekme)
 *         displayOrder:
 *           type: integer
 *           description: Sıralama (küçük önce gelir)
 *           default: 0
 *         isActive:
 *           type: boolean
 *           description: Öğe görünsün mü?
 *           default: true
 */

/**
 * @swagger
 * /api/menu/slug/{slug}/public:
 *   get:
 *     summary: Menüyü slug ile çek (Public - Auth gerektirmez)
 *     description: |
 *       Frontend için menü çeker. Tüm aktif menü öğelerini hiyerarşik yapıda (tree) döner.
 *       Alt menüler (children) ve bağlı içerikler (page, project) dahil.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Menü slug'ı
 *         example: main-menu
 *     responses:
 *       200:
 *         description: Menü başarıyla getirildi
 *       404:
 *         description: Menü bulunamadı
 */
router.get('/slug/:slug/public', menuController.getMenuBySlug);

// Admin routes - Authentication required
router.use(authMiddleware);

/**
 * @swagger
 * /api/menu:
 *   get:
 *     summary: Tüm menüleri listele
 *     description: Sistemdeki tüm menüleri listeler (Ana Menü, Footer Menü vb.)
 *     tags: [Menu]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Menüler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Menu'
 *       401:
 *         description: Yetkisiz erişim
 *   post:
 *     summary: Yeni menü oluştur
 *     description: Yeni bir menü grubu oluşturur (örn. "Footer Menü")
 *     tags: [Menu]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ana Menü
 *               slug:
 *                 type: string
 *                 example: main-menu
 *               description:
 *                 type: string
 *                 example: Site üst kısmında yer alır
 *               location:
 *                 type: string
 *                 example: header
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Menü oluşturuldu
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkisiz erişim
 */
router.get('/', checkPermission('menus', 'read'), menuController.getAllMenus);
router.post('/', checkPermission('menus', 'create'), menuController.createMenu);

/**
 * @swagger
 * /api/menu/{id}:
 *   get:
 *     summary: Menü detayı
 *     description: ID'ye göre menü ve tüm öğelerini getirir
 *     tags: [Menu]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menü ID
 *     responses:
 *       200:
 *         description: Menü getirildi
 *       404:
 *         description: Menü bulunamadı
 *   put:
 *     summary: Menü güncelle
 *     description: Mevcut menüyü günceller
 *     tags: [Menu]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Menu'
 *     responses:
 *       200:
 *         description: Menü güncellendi
 *       404:
 *         description: Menü bulunamadı
 *   delete:
 *     summary: Menü sil
 *     description: Menüyü ve tüm öğelerini siler
 *     tags: [Menu]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menü silindi
 *       404:
 *         description: Menü bulunamadı
 */
router.get('/:id', checkPermission('menus', 'read'), menuController.getMenuById);
router.get('/slug/:slug', checkPermission('menus', 'read'), menuController.getMenuBySlug);
router.put('/:id', checkPermission('menus', 'update'), menuController.updateMenu);
router.delete('/:id', checkPermission('menus', 'delete'), menuController.deleteMenu);

/**
 * @swagger
 * /api/menu/{menuId}/items:
 *   get:
 *     summary: Menünün tüm öğelerini listele
 *     description: Bir menüye ait tüm öğeleri listeler (düz liste, sıralı)
 *     tags: [Menu Items]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Menü ID
 *     responses:
 *       200:
 *         description: Menü öğeleri getirildi
 */
router.get('/:menuId/items', checkPermission('menus', 'read'), menuController.getMenuItemsByMenuId);

/**
 * @swagger
 * /api/menu/items:
 *   post:
 *     summary: Yeni menü öğesi ekle
 *     description: |
 *       Menüye yeni öğe ekler. Örnek kullanımlar:
 *       - Sayfa linki: linkType=page, linkId=5
 *       - Proje linki: linkType=project, linkId=3
 *       - Özel URL: linkType=custom, customUrl="/bagis-yap"
 *       - Alt menü: parentId=2 (üst öğenin ID'si)
 *     tags: [Menu Items]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuId
 *               - title
 *               - linkType
 *             properties:
 *               menuId:
 *                 type: integer
 *                 example: 1
 *               parentId:
 *                 type: integer
 *                 example: null
 *               title:
 *                 type: string
 *                 example: Hakkımızda
 *               linkType:
 *                 type: string
 *                 enum: [page, project, news, activityArea, custom, external]
 *                 example: page
 *               linkId:
 *                 type: integer
 *                 example: 5
 *                 description: linkType=page/project için gerekli
 *               customUrl:
 *                 type: string
 *                 example: /bagis-yap
 *                 description: linkType=custom/external için gerekli
 *               icon:
 *                 type: string
 *                 example: fa-home
 *               target:
 *                 type: string
 *                 enum: [_self, _blank]
 *                 default: _self
 *               displayOrder:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Menü öğesi oluşturuldu
 *       400:
 *         description: Geçersiz veri
 */
router.post('/items', checkPermission('menus', 'create'), menuController.createMenuItem);

/**
 * @swagger
 * /api/menu/items/{id}:
 *   get:
 *     summary: Menü öğesi detayı
 *     tags: [Menu Items]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menü öğesi getirildi
 *   put:
 *     summary: Menü öğesini güncelle
 *     tags: [Menu Items]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MenuItem'
 *     responses:
 *       200:
 *         description: Menü öğesi güncellendi
 *   delete:
 *     summary: Menü öğesini sil
 *     description: Alt öğeleri varsa silinemez, önce onları silin
 *     tags: [Menu Items]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menü öğesi silindi
 *       400:
 *         description: Alt öğeleri var, silinemez
 */
router.get('/items/:id', checkPermission('menus', 'read'), menuController.getMenuItemById);
router.put('/items/:id', checkPermission('menus', 'update'), menuController.updateMenuItem);
router.delete('/items/:id', checkPermission('menus', 'delete'), menuController.deleteMenuItem);

/**
 * @swagger
 * /api/menu/items/bulk-update:
 *   post:
 *     summary: Toplu güncelleme (sıralama/hiyerarşi değişikliği)
 *     description: |
 *       Birden fazla menü öğesinin sıralamasını ve parent ilişkisini günceller.
 *       Drag&drop işlemleri için kullanılır.
 *     tags: [Menu Items]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - displayOrder
 *                   properties:
 *                     id:
 *                       type: integer
 *                     displayOrder:
 *                       type: integer
 *                     parentId:
 *                       type: integer
 *                       nullable: true
 *           example:
 *             items:
 *               - id: 1
 *                 displayOrder: 0
 *                 parentId: null
 *               - id: 2
 *                 displayOrder: 1
 *                 parentId: 1
 *     responses:
 *       200:
 *         description: Menü öğeleri güncellendi
 */
router.post('/items/bulk-update', checkPermission('menus', 'update'), menuController.bulkUpdateMenuItems);

module.exports = router;
