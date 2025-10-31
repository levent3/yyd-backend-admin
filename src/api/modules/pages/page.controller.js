/**
 * Page Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 *
 * NOT: getAllPages ve createPage özel yapıda olduğu için elle tanımlandı.
 * - getAllPages: Karmaşık filter yapısı var
 * - createPage: pageService.createPage(body, userId) formatında (iki parametre)
 *
 * Diğer CRUD işlemleri (getById, update, delete) factory'den geliyor.
 * Public endpoint'ler ayrı tanımlanmış.
 */

const pageService = require('./page.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile - kısmi) ==========

const pageServiceAdapter = {
  // getAllPages özel olduğu için factory'de kullanmıyoruz
  getAll: null,
  getById: (id, query) => pageService.getPageById(id, query.language || 'tr'),
  // createPage özel olduğu için factory'de kullanmıyoruz
  create: null,
  update: (id, data) => pageService.updatePage(id, data),
  delete: (id) => pageService.deletePage(id),
};

const crudController = createCRUDController(pageServiceAdapter, {
  entityName: 'Sayfa',
  entityNamePlural: 'Sayfalar',
});

// ========== ADMIN CONTROLLERS (Özel yapıda olanlar) ==========

// GET /api/pages - Karmaşık filter yapısı nedeniyle elle tanımlı
const getAllPages = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      pageType: req.query.pageType,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      isPublic: req.query.isPublic !== undefined ? req.query.isPublic === 'true' : undefined,
      search: req.query.search,
      orderBy: req.query.orderBy,
      language: req.query.language || 'tr',
      skip: req.query.page ? (parseInt(req.query.page) - 1) * (parseInt(req.query.limit) || 50) : 0,
      take: req.query.limit ? parseInt(req.query.limit) : 50,
    };

    const result = await pageService.getAllPages(filters);

    res.status(200).json({
      pages: result.pages,
      total: result.total,
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/pages/slug/:slug
const getPageBySlug = async (req, res, next) => {
  try {
    const language = req.query.language || 'tr';
    const page = await pageService.getPageBySlug(req.params.slug, language);
    res.status(200).json(page);
  } catch (error) {
    next(error);
  }
};

// POST /api/pages - Service signature farklı olduğu için elle tanımlı
const createPage = async (req, res, next) => {
  try {
    const userId = req.user?.userId; // From authMiddleware
    const page = await pageService.createPage(req.body, userId);
    res.status(201).json(page);
  } catch (error) {
    next(error);
  }
};

// ========== PUBLIC CONTROLLERS ==========

const getPublicPages = async (req, res, next) => {
  try {
    const filters = {
      pageType: req.query.pageType,
      language: req.query.language || 'tr',
    };

    const pages = await pageService.getPublicPages(filters);
    res.status(200).json(pages);
  } catch (error) {
    next(error);
  }
};

const getPublicPageBySlug = async (req, res, next) => {
  try {
    const language = req.query.language || 'tr';
    const page = await pageService.getPublicPageBySlug(req.params.slug, language);
    res.status(200).json(page);
  } catch (error) {
    next(error);
  }
};

const getPublicPagesByType = async (req, res, next) => {
  try {
    const language = req.query.language || 'tr';
    const pages = await pageService.getPublicPagesByType(req.params.pageType, language);
    res.status(200).json(pages);
  } catch (error) {
    next(error);
  }
};

// ========== PAGE BUILDER CONTROLLERS ==========

// PUT /api/pages/:id/builder - Save builder data
const updateBuilderData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { language = 'tr', builderData, builderHtml, builderCss } = req.body;

    const result = await pageService.updateBuilderData(id, language, {
      builderData,
      builderHtml,
      builderCss
    });

    res.status(200).json({
      message: 'Builder data başarıyla güncellendi',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/pages/:id/builder - Get builder data
const getBuilderData = async (req, res, next) => {
  try {
    const { id } = req.params;
    const language = req.query.language || 'tr';

    const builderData = await pageService.getBuilderData(id, language);
    res.status(200).json(builderData);
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Admin endpoints
  getAllPages, // Elle tanımlı
  getPageById: crudController.getById, // Factory'den
  getPageBySlug, // Elle tanımlı
  createPage, // Elle tanımlı
  updatePage: crudController.update, // Factory'den
  deletePage: crudController.delete, // Factory'den

  // Public endpoints
  getPublicPages,
  getPublicPageBySlug,
  getPublicPagesByType,

  // Page Builder endpoints
  updateBuilderData,
  getBuilderData,
};
