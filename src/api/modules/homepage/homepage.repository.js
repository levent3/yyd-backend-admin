const prisma = require('../../../config/prismaClient');

// ========== HOME SLIDER ==========

const getAllSliders = () => {
  return prisma.homeSlider.findMany({
    where: { isActive: true },
    include: {
      project: {
        select: {
          id: true,
          shortCode: true,
          translations: true
        }
      }
    },
    orderBy: { displayOrder: 'asc' },
  });
};

const getSliderById = (id) => {
  return prisma.homeSlider.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          shortCode: true,
          translations: true
        }
      }
    },
  });
};

const createSlider = (data) => {
  return prisma.homeSlider.create({
    data: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      buttonText: data.buttonText,
      buttonLink: data.buttonLink,
      projectId: data.projectId,
      displayOrder: data.displayOrder || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
    include: {
      project: {
        select: {
          id: true,
          shortCode: true,
          translations: true
        }
      }
    },
  });
};

const updateSlider = (id, data) => {
  return prisma.homeSlider.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      buttonText: data.buttonText,
      buttonLink: data.buttonLink,
      projectId: data.projectId,
      displayOrder: data.displayOrder,
      isActive: data.isActive,
    },
    include: {
      project: {
        select: {
          id: true,
          shortCode: true,
          translations: true
        }
      }
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
