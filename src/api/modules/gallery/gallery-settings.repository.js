const prisma = require('../../../config/prismaClient');

// GallerySettings is singleton, always use ID 1
const SETTINGS_ID = 1;

const getSettings = async (language = null) => {
  const include = {
    translations: language ? {
      where: { language }
    } : true
  };

  let settings = await prisma.gallerySettings.findUnique({
    where: { id: SETTINGS_ID },
    include
  });

  // If settings don't exist, create default
  if (!settings) {
    settings = await prisma.gallerySettings.create({
      data: {
        id: SETTINGS_ID,
        translations: {
          create: [
            {
              language: 'tr',
              title: 'Galeri',
              description: 'Yeryüzü Doktorları foto ve video galeri'
            },
            {
              language: 'en',
              title: 'Gallery',
              description: 'Doctors Worldwide photo and video gallery'
            },
            {
              language: 'ar',
              title: 'معرض',
              description: 'معرض صور وفيديو أطباء العالم'
            }
          ]
        }
      },
      include
    });
  }

  return settings;
};

const updateSettings = async (data) => {
  const updateData = {};

  if (data.coverImage !== undefined) {
    updateData.coverImage = data.coverImage;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  // Handle translations if provided
  if (data.translations && data.translations.length > 0) {
    updateData.translations = {
      upsert: data.translations.map(trans => ({
        where: {
          settingsId_language: {
            settingsId: SETTINGS_ID,
            language: trans.language
          }
        },
        create: {
          language: trans.language,
          title: trans.title,
          description: trans.description || null
        },
        update: {
          title: trans.title,
          description: trans.description || null
        }
      }))
    };
  }

  return prisma.gallerySettings.update({
    where: { id: SETTINGS_ID },
    data: updateData,
    include: {
      translations: true
    }
  });
};

module.exports = {
  getSettings,
  updateSettings
};
