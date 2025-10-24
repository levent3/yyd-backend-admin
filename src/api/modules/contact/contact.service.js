const contactRepo = require('./contact.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');

const getAllMessages = async (queryParams = {}) => {
  const { page, limit, status, ...rest } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {};
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    contactRepo.findMany({ skip, take, where }),
    contactRepo.count(where),
  ]);

  return createPaginatedResponse(data, total, parseInt(page) || 1, take);
};

const getMessageById = (id) => {
  return contactRepo.findById(id);
};

const createMessage = (data) => {
  const mappedData = {
    fullName: data.fullName || data.name, // Support both fullName and name
    email: data.email,
    phoneNumber: data.phoneNumber || null,
    subject: data.subject,
    message: data.message,
    status: 'new'
  };

  return contactRepo.create(mappedData);
};

const updateMessage = (id, data) => {
  const mappedData = {};

  if (data.status !== undefined) {
    mappedData.status = data.status;
  }

  if (data.fullName !== undefined) {
    mappedData.fullName = data.fullName;
  }

  if (data.email !== undefined) {
    mappedData.email = data.email;
  }

  if (data.phoneNumber !== undefined) {
    mappedData.phoneNumber = data.phoneNumber;
  }

  if (data.subject !== undefined) {
    mappedData.subject = data.subject;
  }

  if (data.message !== undefined) {
    mappedData.message = data.message;
  }

  return contactRepo.update(id, mappedData);
};

const deleteMessage = (id) => {
  return contactRepo.deleteById(id);
};

const markAsRead = (id) => {
  return contactRepo.markAsRead(id);
};

const getUnreadCount = () => {
  return contactRepo.getUnreadCount();
};

module.exports = {
  getAllMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
  markAsRead,
  getUnreadCount
};
