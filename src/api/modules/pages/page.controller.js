const pageService = require('./page.service');

// ========== ADMIN CONTROLLERS ==========

const getAllPages = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      pageType: req.query.pageType,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      isPublic: req.query.isPublic !== undefined ? req.query.isPublic === 'true' : undefined,
      search: req.query.search,
      orderBy: req.query.orderBy,
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

const getPageById = async (req, res, next) => {
  try {
    const page = await pageService.getPageById(req.params.id);
    res.status(200).json(page);
  } catch (error) {
    next(error);
  }
};

const getPageBySlug = async (req, res, next) => {
  try {
    const page = await pageService.getPageBySlug(req.params.slug);
    res.status(200).json(page);
  } catch (error) {
    next(error);
  }
};

const createPage = async (req, res, next) => {
  try {
    const userId = req.user?.userId; // From authMiddleware
    const page = await pageService.createPage(req.body, userId);
    res.status(201).json(page);
  } catch (error) {
    next(error);
  }
};

const updatePage = async (req, res, next) => {
  try {
    const page = await pageService.updatePage(req.params.id, req.body);
    res.status(200).json(page);
  } catch (error) {
    next(error);
  }
};

const deletePage = async (req, res, next) => {
  try {
    await pageService.deletePage(req.params.id);
    res.status(200).json({ message: 'Page deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ========== PUBLIC CONTROLLERS ==========

const getPublicPages = async (req, res, next) => {
  try {
    const filters = {
      pageType: req.query.pageType,
    };

    const pages = await pageService.getPublicPages(filters);
    res.status(200).json(pages);
  } catch (error) {
    next(error);
  }
};

const getPublicPageBySlug = async (req, res, next) => {
  try {
    const page = await pageService.getPublicPageBySlug(req.params.slug);
    res.status(200).json(page);
  } catch (error) {
    next(error);
  }
};

const getPublicPagesByType = async (req, res, next) => {
  try {
    const pages = await pageService.getPublicPagesByType(req.params.pageType);
    res.status(200).json(pages);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  getPublicPages,
  getPublicPageBySlug,
  getPublicPagesByType,
};
