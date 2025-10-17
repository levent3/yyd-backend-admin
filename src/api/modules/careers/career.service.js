const careerRepo = require('./career.repository');
const { parsePagination, createPaginatedResponse } = require('../../../utils/pagination');

const getAllApplications = async (queryParams = {}) => {
  const { page, limit, status, position, ...rest } = queryParams;
  const { skip, limit: take } = parsePagination(page, limit);

  const where = {};

  if (status) where.status = status;

  if (position) {
    where.position = {
      contains: position,
      mode: 'insensitive'
    };
  }

  const [data, total] = await Promise.all([
    careerRepo.findMany({ skip, take, where }),
    careerRepo.count(where),
  ]);

  return createPaginatedResponse(data, total, parseInt(page) || 1, take);
};

const getApplicationById = (id) => {
  return careerRepo.findById(id);
};

const createApplication = (data) => {
  const mappedData = {
    fullName: data.fullName,
    email: data.email,
    phoneNumber: data.phoneNumber || null,
    position: data.position || null,
    coverLetter: data.coverLetter || null,
    cvUrl: data.cvUrl,
    status: 'new'
  };

  return careerRepo.create(mappedData);
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

  if (data.position !== undefined) {
    mappedData.position = data.position;
  }

  if (data.coverLetter !== undefined) {
    mappedData.coverLetter = data.coverLetter;
  }

  if (data.cvUrl !== undefined) {
    mappedData.cvUrl = data.cvUrl;
  }

  return careerRepo.update(id, mappedData);
};

const deleteApplication = (id) => {
  return careerRepo.deleteById(id);
};

const getPendingCount = () => {
  return careerRepo.getPendingCount();
};

const getApplicationsByStatus = (status) => {
  return careerRepo.findByStatus(status);
};

const getApplicationsByPosition = (position) => {
  return careerRepo.findByPosition(position);
};

module.exports = {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getPendingCount,
  getApplicationsByStatus,
  getApplicationsByPosition
};
