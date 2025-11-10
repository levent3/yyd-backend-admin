const menuRepo = require('./menu.repository');

// ========== MENU SERVICES ==========

const getAllMenus = async () => {
  return await menuRepo.getAllMenus();
};

const getMenuById = async (id) => {
  const menu = await menuRepo.getMenuById(id);
  if (!menu) {
    throw new Error('Menü bulunamadı');
  }
  return menu;
};

const getMenuBySlug = async (slug) => {
  const menu = await menuRepo.getMenuBySlug(slug);
  if (!menu) {
    throw new Error('Menü bulunamadı');
  }
  return menu;
};

const createMenu = async (data) => {
  // Slug kontrolü
  if (!data.slug) {
    throw new Error('Slug gereklidir');
  }

  // Slug benzersizlik kontrolü
  const existing = await menuRepo.getMenuBySlug(data.slug);
  if (existing) {
    throw new Error('Bu slug ile bir menü zaten mevcut');
  }

  return await menuRepo.createMenu(data);
};

const updateMenu = async (id, data) => {
  // Menü var mı kontrol et
  await getMenuById(id);

  // Slug değişiyorsa benzersizlik kontrolü
  if (data.slug) {
    const existing = await menuRepo.getMenuBySlug(data.slug);
    if (existing && existing.id !== id) {
      throw new Error('Bu slug ile bir menü zaten mevcut');
    }
  }

  return await menuRepo.updateMenu(id, data);
};

const deleteMenu = async (id) => {
  // Menü var mı kontrol et
  await getMenuById(id);

  return await menuRepo.deleteMenu(id);
};

// ========== MENU ITEM SERVICES ==========

const getMenuItemsByMenuId = async (menuId) => {
  // Menü var mı kontrol et
  await getMenuById(menuId);

  return await menuRepo.getMenuItemsByMenuId(menuId);
};

const getMenuItemById = async (id) => {
  const menuItem = await menuRepo.getMenuItemById(id);
  if (!menuItem) {
    throw new Error('Menü öğesi bulunamadı');
  }
  return menuItem;
};

const createMenuItem = async (data) => {
  // Gerekli alan kontrolü
  if (!data.title) {
    throw new Error('Başlık gereklidir');
  }

  if (!data.linkType) {
    throw new Error('Link tipi gereklidir');
  }

  // Menü var mı kontrol et
  await getMenuById(data.menuId);

  // Parent kontrolü
  if (data.parentId) {
    await getMenuItemById(data.parentId);
  }

  // linkType'a göre validasyon
  if (data.linkType === 'page' && !data.pageId) {
    throw new Error('page link tipi için pageId gereklidir');
  }

  if (data.linkType === 'project' && !data.projectId) {
    throw new Error('project link tipi için projectId gereklidir');
  }

  if (data.linkType === 'news' && !data.newsId) {
    throw new Error('news link tipi için newsId gereklidir');
  }

  if (data.linkType === 'activityArea' && !data.activityAreaId) {
    throw new Error('activityArea link tipi için activityAreaId gereklidir');
  }

  if (data.linkType === 'custom' || data.linkType === 'external') {
    if (!data.customUrl) {
      throw new Error(`${data.linkType} için customUrl gereklidir`);
    }
  }

  return await menuRepo.createMenuItem(data);
};

const updateMenuItem = async (id, data) => {
  // Menü öğesi var mı kontrol et
  await getMenuItemById(id);

  // Parent kontrolü (kendisine parent olamaz)
  if (data.parentId) {
    if (data.parentId === id) {
      throw new Error('Menü öğesi kendi parent\'ı olamaz');
    }
    await getMenuItemById(data.parentId);
  }

  return await menuRepo.updateMenuItem(id, data);
};

const deleteMenuItem = async (id) => {
  // Menü öğesi var mı kontrol et
  const menuItem = await getMenuItemById(id);

  // Alt öğeleri kontrol et
  if (menuItem.children && menuItem.children.length > 0) {
    throw new Error('Alt öğeleri olan menü öğesi silinemez. Önce alt öğeleri silin.');
  }

  return await menuRepo.deleteMenuItem(id);
};

const bulkUpdateMenuItems = async (items) => {
  // Tüm öğelerin varlığını kontrol et
  for (const item of items) {
    await getMenuItemById(item.id);
  }

  return await menuRepo.bulkUpdateMenuItems(items);
};

module.exports = {
  // Menu
  getAllMenus,
  getMenuById,
  getMenuBySlug,
  createMenu,
  updateMenu,
  deleteMenu,

  // Menu Items
  getMenuItemsByMenuId,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  bulkUpdateMenuItems
};
