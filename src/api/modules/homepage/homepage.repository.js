const prisma = require('../../../config/prismaClient');
const { includeTranslations } = require('../../../utils/translationHelper');

// ========== HOME SLIDER ==========

const getAllSliders = (language = null) => {
  return prisma.homeSlider.findMany({
    where: { isActive: true },
    include: {
      project: {
        select: {
          id: true,
          shortCode: true,
          translations: true
        }
      },
      ...includeTranslations(language)
    },
    orderBy: { displayOrder: 'asc' },
  });
};

const getSliderById = (id, language = null) => {
  return prisma.homeSlider.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          shortCode: true,
          translations: true
        }
      },
      ...includeTranslations(language)
    },
  });
};

const createSlider = (data) => {
  const { translations, ...rest } = data;

  return prisma.homeSlider.create({
    data: {
      imageUrl: rest.imageUrl,
      mobileImageUrl: rest.mobileImageUrl || null,
      videoUrl: rest.videoUrl || null,
      projectId: rest.projectId || null,
      displayOrder: rest.displayOrder || 0,
      isActive: rest.isActive !== undefined ? rest.isActive : true,
      showTitle: rest.showTitle !== undefined ? rest.showTitle : true,
      startDate: rest.startDate ? new Date(rest.startDate) : null,
      endDate: rest.endDate ? new Date(rest.endDate) : null,
      translations: translations ? {
        create: translations.map(trans => ({
          language: trans.language,
          title: trans.title,
          subtitle: trans.subtitle || null,
          summary: trans.summary || null,
          buttonText: trans.buttonText || null,
          buttonLink: trans.buttonLink || null
        }))
      } : undefined
    },
    include: {
      project: {
        select: {
          id: true,
          shortCode: true,
          translations: true
        }
      },
      translations: true
    },
  });
};

const updateSlider = (id, data) => {
  const { translations, ...rest } = data;
  const updateData = {};

  // Dil-bağımsız alanları güncelle
  if (rest.imageUrl !== undefined) updateData.imageUrl = rest.imageUrl;
  if (rest.mobileImageUrl !== undefined) updateData.mobileImageUrl = rest.mobileImageUrl;
  if (rest.videoUrl !== undefined) updateData.videoUrl = rest.videoUrl;
  if (rest.projectId !== undefined) updateData.projectId = rest.projectId;
  if (rest.displayOrder !== undefined) updateData.displayOrder = rest.displayOrder;
  if (rest.isActive !== undefined) updateData.isActive = rest.isActive;
  if (rest.showTitle !== undefined) updateData.showTitle = rest.showTitle;
  if (rest.startDate !== undefined) updateData.startDate = rest.startDate ? new Date(rest.startDate) : null;
  if (rest.endDate !== undefined) updateData.endDate = rest.endDate ? new Date(rest.endDate) : null;

  // Translations güncelleme (varsa)
  if (translations && translations.length > 0) {
    updateData.translations = {
      upsert: translations.map(trans => ({
        where: {
          sliderId_language: {
            sliderId: id,
            language: trans.language
          }
        },
        create: {
          language: trans.language,
          title: trans.title,
          subtitle: trans.subtitle || null,
          summary: trans.summary || null,
          buttonText: trans.buttonText || null,
          buttonLink: trans.buttonLink || null
        },
        update: {
          title: trans.title,
          subtitle: trans.subtitle || null,
          summary: trans.summary || null,
          buttonText: trans.buttonText || null,
          buttonLink: trans.buttonLink || null
        }
      }))
    };
  }

  return prisma.homeSlider.update({
    where: { id },
    data: updateData,
    include: {
      project: {
        select: {
          id: true,
          shortCode: true,
          translations: true
        }
      },
      translations: true
    },
  });
};

const deleteSlider = (id) => {
  return prisma.homeSlider.delete({
    where: { id },
  });
};

// ========== SITE STATISTICS ==========

const getStatistics = () => {
  return prisma.siteStatistics.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
  });
};

const createStatistics = (data) => {
  return prisma.siteStatistics.create({
    data: {
      countryCount: data.countryCount || 0,
      examinationCount: data.examinationCount || 0,
      surgeryCount: data.surgeryCount || 0,
      volunteerCount: data.volunteerCount || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
};

const updateStatistics = (id, data) => {
  return prisma.siteStatistics.update({
    where: { id },
    data: {
      countryCount: data.countryCount,
      examinationCount: data.examinationCount,
      surgeryCount: data.surgeryCount,
      volunteerCount: data.volunteerCount,
      isActive: data.isActive,
    },
  });
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
  createStatistics,
  updateStatistics,
};
