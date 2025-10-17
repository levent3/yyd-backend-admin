const newsService = require('./news.service');

// GET /api/news - Get all news (admin)
const getAllNews = async (req, res, next) => {
  try {
    const result = await newsService.getAllNews(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// GET /api/news/published - Get published news (public)
const getPublishedNews = async (req, res, next) => {
  try {
    const news = await newsService.getPublishedNews();
    res.json(news);
  } catch (error) {
    next(error);
  }
};

// GET /api/news/:id - Get news by ID
const getNewsById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const news = await newsService.getNewsById(id);

    if (!news) {
      return res.status(404).json({ message: 'Haber bulunamadı' });
    }

    res.json(news);
  } catch (error) {
    next(error);
  }
};

// GET /api/news/slug/:slug - Get news by slug (public)
const getNewsBySlug = async (req, res, next) => {
  try {
    const news = await newsService.getNewsBySlug(req.params.slug);

    if (!news) {
      return res.status(404).json({ message: 'Haber bulunamadı' });
    }

    res.json(news);
  } catch (error) {
    next(error);
  }
};

// POST /api/news - Create news
const createNews = async (req, res, next) => {
  try {
    const newsData = {
      ...req.body,
      authorId: req.user.id // From auth middleware
    };

    const news = await newsService.createNews(newsData);
    res.status(201).json(news);
  } catch (error) {
    next(error);
  }
};

// PUT /api/news/:id - Update news
const updateNews = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const news = await newsService.updateNews(id, req.body);
    res.json(news);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/news/:id - Delete news
const deleteNews = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await newsService.deleteNews(id);
    res.json({ message: 'Haber silindi' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNews,
  getPublishedNews,
  getNewsById,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews
};
