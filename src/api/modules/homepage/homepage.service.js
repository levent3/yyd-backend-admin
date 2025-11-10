const homepageRepo = require('./homepage.repository');

// ========== HOME SLIDER ==========

const getAllSliders = async () => {
  return await homepageRepo.getAllSliders();
};

const getSliderById = async (id) => {
  const slider = await homepageRepo.getSliderById(id);
  if (!slider) {
    const error = new Error('Slider bulunamadı');
    error.statusCode = 404;
    throw error;
  }
  return slider;
};

const createSlider = async (data) => {
  // Validations
  if (!data.title || !data.title.trim()) {
    const error = new Error('Başlık gereklidir');
    error.statusCode = 400;
    throw error;
  }

  if (!data.imageUrl || !data.imageUrl.trim()) {
    const error = new Error('Görsel gereklidir');
    error.statusCode = 400;
    throw error;
  }

  return await homepageRepo.createSlider(data);
};

const updateSlider = async (id, data) => {
  // Check if slider exists
  await getSliderById(id);

  // Validations
  if (data.title !== undefined && !data.title.trim()) {
    const error = new Error('Başlık boş olamaz');
    error.statusCode = 400;
    throw error;
  }

  if (data.imageUrl !== undefined && !data.imageUrl.trim()) {
    const error = new Error('Görsel URL boş olamaz');
    error.statusCode = 400;
    throw error;
  }

  return await homepageRepo.updateSlider(id, data);
};

const deleteSlider = async (id) => {
  // Check if slider exists
  await getSliderById(id);

  return await homepageRepo.deleteSlider(id);
};

// ========== SITE STATISTICS ==========

const getStatistics = async () => {
  const stats = await homepageRepo.getStatistics();

  // If no statistics exist, create default one
  if (!stats) {
    return await homepageRepo.createStatistics({
      countryCount: 0,
      examinationCount: 0,
      surgeryCount: 0,
      volunteerCount: 0,
    });
  }

  return stats;
};

const updateStatistics = async (id, data) => {
  // Validate counts are non-negative
  const fields = ['countryCount', 'examinationCount', 'surgeryCount', 'volunteerCount'];
  for (const field of fields) {
    if (data[field] !== undefined && data[field] < 0) {
      const error = new Error(`${field} negatif olamaz`);
      error.statusCode = 400;
      throw error;
    }
  }

  return await homepageRepo.updateStatistics(id, data);
};

const createOrUpdateStatistics = async (data) => {
  const existing = await homepageRepo.getStatistics();

  if (existing) {
    return await updateStatistics(existing.id, data);
  } else {
    return await homepageRepo.createStatistics(data);
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
