const menuService = require('./menu.service');

// ========== MENU CONTROLLERS ==========

// GET /api/menu - Get all menus
const getAllMenus = async (req, res, next) => {
  try {
    const menus = await menuService.getAllMenus();
    res.status(200).json(menus);
  } catch (error) {
    next(error);
  }
};

// GET /api/menu/:id - Get menu by ID
const getMenuById = async (req, res, next) => {
  try {
    const menu = await menuService.getMenuById(parseInt(req.params.id));
    res.status(200).json(menu);
  } catch (error) {
    next(error);
  }
};

// GET /api/menu/slug/:slug - Get menu by slug
const getMenuBySlug = async (req, res, next) => {
  try {
    const menu = await menuService.getMenuBySlug(req.params.slug);
    res.status(200).json(menu);
  } catch (error) {
    next(error);
  }
};

// POST /api/menu - Create menu
const createMenu = async (req, res, next) => {
  try {
    const menu = await menuService.createMenu(req.body);
    res.status(201).json({
      message: 'Menü başarıyla oluşturuldu',
      data: menu
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/menu/:id - Update menu
const updateMenu = async (req, res, next) => {
  try {
    const menu = await menuService.updateMenu(parseInt(req.params.id), req.body);
    res.status(200).json({
      message: 'Menü başarıyla güncellendi',
      data: menu
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/menu/:id - Delete menu
const deleteMenu = async (req, res, next) => {
  try {
    await menuService.deleteMenu(parseInt(req.params.id));
    res.status(200).json({
      message: 'Menü başarıyla silindi'
    });
  } catch (error) {
    next(error);
  }
};

// ========== MENU ITEM CONTROLLERS ==========

// GET /api/menu/:menuId/items - Get all menu items by menu ID
const getMenuItemsByMenuId = async (req, res, next) => {
  try {
    const items = await menuService.getMenuItemsByMenuId(parseInt(req.params.menuId));
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};

// GET /api/menu/items/:id - Get menu item by ID
const getMenuItemById = async (req, res, next) => {
  try {
    const item = await menuService.getMenuItemById(parseInt(req.params.id));
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

// POST /api/menu/items - Create menu item
const createMenuItem = async (req, res, next) => {
  try {
    const item = await menuService.createMenuItem(req.body);
    res.status(201).json({
      message: 'Menü öğesi başarıyla oluşturuldu',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/menu/items/:id - Update menu item
const updateMenuItem = async (req, res, next) => {
  try {
    const item = await menuService.updateMenuItem(parseInt(req.params.id), req.body);
    res.status(200).json({
      message: 'Menü öğesi başarıyla güncellendi',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/menu/items/:id - Delete menu item
const deleteMenuItem = async (req, res, next) => {
  try {
    await menuService.deleteMenuItem(parseInt(req.params.id));
    res.status(200).json({
      message: 'Menü öğesi başarıyla silindi'
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/menu/items/bulk-update - Bulk update menu items (for reordering)
const bulkUpdateMenuItems = async (req, res, next) => {
  try {
    await menuService.bulkUpdateMenuItems(req.body.items);
    res.status(200).json({
      message: 'Menü öğeleri başarıyla güncellendi'
    });
  } catch (error) {
    next(error);
  }
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
