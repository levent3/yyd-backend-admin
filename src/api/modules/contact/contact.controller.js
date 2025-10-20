const contactService = require('./contact.service');

// GET /api/contact - Get all messages (admin)
const getAllMessages = async (req, res, next) => {
  try {
    const result = await contactService.getAllMessages(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// GET /api/contact/unread-count - Get unread message count
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await contactService.getUnreadCount();
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

// GET /api/contact/:id - Get message by ID
const getMessageById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const message = await contactService.getMessageById(id);

    if (!message) {
      return res.status(404).json({ message: 'Mesaj bulunamadı' });
    }

    res.json(message);
  } catch (error) {
    next(error);
  }
};

// POST /api/contact - Create contact message (public)
const createMessage = async (req, res, next) => {
  try {
    const message = await contactService.createMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// PUT /api/contact/:id - Update message status
const updateMessage = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const message = await contactService.updateMessage(id, req.body);
    res.json(message);
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

// DELETE /api/contact/:id - Delete message
const deleteMessage = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await contactService.deleteMessage(id);
    res.json({ message: 'Mesaj silindi' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMessages,
  getUnreadCount,
  getMessageById,
  createMessage,
  updateMessage,
  markAsRead,
  deleteMessage
};
