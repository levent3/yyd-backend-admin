const homepageService = require('./homepage.service');

// ========== HOME SLIDER ==========

const getAllSliders = async (req, res, next) => {
  try {
    const sliders = await homepageService.getAllSliders();
    res.status(200).json(sliders);
  } catch (error) {
    next(error);
  }
};

const getSliderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slider = await homepageService.getSliderById(parseInt(id));
    res.status(200).json(slider);
  } catch (error) {
    next(error);
  }
};

const createSlider = async (req, res, next) => {
  try {
    const slider = await homepageService.createSlider(req.body);
    res.status(201).json({
      success: true,
      message: 'Slider başarıyla oluşturuldu',
      data: slider
    });
  } catch (error) {
    next(error);
  }
};

const updateSlider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slider = await homepageService.updateSlider(parseInt(id), req.body);
    res.status(200).json({
      success: true,
      message: 'Slider başarıyla güncellendi',
      data: slider
    });
  } catch (error) {
    next(error);
  }
};

const deleteSlider = async (req, res, next) => {
  try {
    const { id } = req.params;
    await homepageService.deleteSlider(parseInt(id));
    res.status(200).json({
      success: true,
      message: 'Slider başarıyla silindi'
    });
  } catch (error) {
    next(error);
  }
};

// ========== SITE STATISTICS ==========

const getStatistics = async (req, res, next) => {
  try {
    const statistics = await homepageService.getStatistics();
    res.status(200).json(statistics);
  } catch (error) {
    next(error);
  }
};

const updateStatistics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const statistics = await homepageService.updateStatistics(parseInt(id), req.body);
    res.status(200).json({
      success: true,
      message: 'İstatistikler başarıyla güncellendi',
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};

const createOrUpdateStatistics = async (req, res, next) => {
  try {
    const statistics = await homepageService.createOrUpdateStatistics(req.body);
    res.status(200).json({
      success: true,
      message: 'İstatistikler başarıyla kaydedildi',
      data: statistics
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Sliders
  getAllSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,

  // Statistics
  getStatistics,
  updateStatistics,
  createOrUpdateStatistics,
};
