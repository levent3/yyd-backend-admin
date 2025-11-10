const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ========== MENU CRUD ==========

// Get all menus
const getAllMenus = () => {
  return prisma.menu.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { menuItems: true }
      }
    }
  });
};

// Get menu by ID
const getMenuById = (id) => {
  return prisma.menu.findUnique({
    where: { id },
    include: {
      menuItems: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        include: {
          page: {
            select: {
              id: true,
              translations: {
                select: { title: true, slug: true, language: true }
              }
            }
          },
          project: {
            select: {
              id: true,
              shortCode: true,
              translations: {
                select: { title: true, language: true }
              }
            }
          },
          news: {
            select: {
              id: true,
              translations: {
                select: { title: true, slug: true, language: true }
              }
            }
          },
          activityArea: {
            select: {
              id: true,
              translations: {
                select: { title: true, slug: true, language: true }
              }
            }
          },
          children: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' }
          }
        }
      }
    }
  });
};

// Get menu by slug
const getMenuBySlug = (slug) => {
  return prisma.menu.findUnique({
    where: { slug },
    include: {
      menuItems: {
        where: { isActive: true, parentId: null },
        orderBy: { displayOrder: 'asc' },
        include: {
          page: {
            select: {
              id: true,
              translations: {
                select: { title: true, slug: true, language: true }
              }
            }
          },
          project: {
            select: {
              id: true,
              shortCode: true,
              translations: {
                select: { title: true, language: true }
              }
            }
          },
          children: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
            include: {
              page: {
                select: {
                  id: true,
                  translations: {
                    select: { title: true, slug: true, language: true }
                  }
                }
              },
              project: {
                select: {
                  id: true,
                  shortCode: true,
                  translations: {
                    select: { title: true, language: true }
                  }
                }
              },
              news: {
                select: {
                  id: true,
                  translations: {
                    select: { title: true, slug: true, language: true }
                  }
                }
              },
              activityArea: {
                select: {
                  id: true,
                  translations: {
                    select: { title: true, slug: true, language: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
};

// Create menu
const createMenu = (data) => {
  return prisma.menu.create({
    data
  });
};

// Update menu
const updateMenu = (id, data) => {
  return prisma.menu.update({
    where: { id },
    data
  });
};

// Delete menu
const deleteMenu = (id) => {
  return prisma.menu.delete({
    where: { id }
  });
};

// ========== MENU ITEM CRUD ==========

// Get all menu items by menu ID
const getMenuItemsByMenuId = (menuId) => {
  return prisma.menuItem.findMany({
    where: { menuId },
    orderBy: { displayOrder: 'asc' },
    include: {
      page: {
        select: {
          id: true,
          translations: {
            select: { title: true, slug: true, language: true }
          }
        }
      },
      project: {
        select: {
          id: true,
          shortCode: true,
          translations: {
            select: { title: true, language: true }
          }
        }
      },
      news: {
        select: {
          id: true,
          translations: {
            select: { title: true, slug: true, language: true }
          }
        }
      },
      activityArea: {
        select: {
          id: true,
          translations: {
            select: { title: true, slug: true, language: true }
          }
        }
      },
      parent: {
        select: { id: true, title: true }
      },
      children: {
        orderBy: { displayOrder: 'asc' }
      }
    }
  });
};

// Get menu item by ID
const getMenuItemById = (id) => {
  return prisma.menuItem.findUnique({
    where: { id },
    include: {
      page: {
        select: {
          id: true,
          translations: {
            select: { title: true, slug: true, language: true }
          }
        }
      },
      project: {
        select: {
          id: true,
          shortCode: true,
          translations: {
            select: { title: true, language: true }
          }
        }
      },
      news: {
        select: {
          id: true,
          translations: {
            select: { title: true, slug: true, language: true }
          }
        }
      },
      activityArea: {
        select: {
          id: true,
          translations: {
            select: { title: true, slug: true, language: true }
          }
        }
      },
      children: true
    }
  });
};

// Create menu item
const createMenuItem = (data) => {
  return prisma.menuItem.create({
    data,
    include: {
      page: true,
      project: true,
      news: true,
      activityArea: true
    }
  });
};

// Update menu item
const updateMenuItem = (id, data) => {
  return prisma.menuItem.update({
    where: { id },
    data,
    include: {
      page: true,
      project: true,
      news: true,
      activityArea: true
    }
  });
};

// Delete menu item
const deleteMenuItem = (id) => {
  return prisma.menuItem.delete({
    where: { id }
  });
};

// Bulk update menu items (for reordering)
const bulkUpdateMenuItems = async (items) => {
  const operations = items.map(item =>
    prisma.menuItem.update({
      where: { id: item.id },
      data: {
        displayOrder: item.displayOrder,
        parentId: item.parentId
      }
    })
  );
  return prisma.$transaction(operations);
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
