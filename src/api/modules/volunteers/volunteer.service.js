const volunteerRepo = require('./volunteer.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');

const getAllApplications = async (queryParams = {}) => {
  const { page, limit, status, ...rest } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {};

  if (status) where.status = status;

  const [data, total] = await Promise.all([
    volunteerRepo.findMany({ skip, take, where }),
    volunteerRepo.count(where),
  ]);

  return createPaginatedResponse(data, total, parseInt(page) || 1, take);
};

const getApplicationById = (id) => {
  return volunteerRepo.findById(id);
};

const createApplication = (data) => {
  const mappedData = {
    fullName: data.fullName,
    email: data.email,
    phoneNumber: data.phoneNumber || null,
    message: data.message || null,
    status: 'new'
  };

  return volunteerRepo.create(mappedData);
};

const updateApplication = (id, data) => {
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

  if (data.message !== undefined) {
    mappedData.message = data.message;
  }

  return volunteerRepo.update(id, mappedData);
};

const deleteApplication = (id) => {
  return volunteerRepo.deleteById(id);
};

const getPendingCount = () => {
  return volunteerRepo.getPendingCount();
};

module.exports = {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getPendingCount
};
