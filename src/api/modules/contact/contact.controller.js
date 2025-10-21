/**
 * Contact Controller
 *
 * REFACTORING NOTU:
 * -----------------
 * Bu controller artık generic controllerFactory kullanıyor.
 * Standard CRUD işlemleri factory'den geliyor.
 * Özel metodlar (getUnreadCount, markAsRead) elle tanımlanmış.
 */

const contactService = require('./contact.service');
const { createCRUDController } = require('../../../utils/controllerFactory');

// ========== STANDARD CRUD OPERATIONS (Factory ile) ==========

const contactServiceAdapter = {
  getAll: (query) => contactService.getAllMessages(query),
  getById: (id) => contactService.getMessageById(id),
  create: (data) => contactService.createMessage(data),
  update: (id, data) => contactService.updateMessage(id, data),
  delete: (id) => contactService.deleteMessage(id),
};

const crudController = createCRUDController(contactServiceAdapter, {
  entityName: 'Mesaj',
  entityNamePlural: 'Mesajlar',
});

// ========== ÖZEL METODLAR ==========

// GET /api/contact/unread-count - Get unread message count
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await contactService.getUnreadCount();
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

// PUT /api/contact/:id/read - Mark message as read
const markAsRead = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const message = await contactService.markAsRead(id);
    res.json(message);
  } catch (error) {
    next(error);
  }
};

// ========== EXPORT ==========

module.exports = {
  // Standard CRUD (factory'den)
  getAllMessages: crudController.getAll,
  getMessageById: crudController.getById,
  createMessage: crudController.create,
  updateMessage: crudController.update,
  deleteMessage: crudController.delete,

  // Özel metodlar
  getUnreadCount,
  markAsRead,
};
