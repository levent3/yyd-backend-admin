const express = require('express');
const successStoryController = require('./success-story.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');
const { cacheMiddleware } = require('../../middlewares/cacheMiddleware');
const router = express.Router();

// PUBLIC ROUTES
router.get('/public', cacheMiddleware(3600), successStoryController.getAllActiveSuccessStories);
router.get('/featured', cacheMiddleware(1800), successStoryController.getFeaturedSuccessStories);
router.get('/location/:location', cacheMiddleware(3600), successStoryController.getSuccessStoriesByLocation);
router.get('/slug/:slug', cacheMiddleware(3600), successStoryController.getSuccessStoryBySlug);

// ADMIN ROUTES
router.use(authMiddleware);
router.get('/', checkPermission('media', 'read'), successStoryController.getAllSuccessStories);
router.get('/:id', checkPermission('media', 'read'), successStoryController.getSuccessStoryById);
router.post('/', checkPermission('media', 'create'), successStoryController.createSuccessStory);
router.put('/:id', checkPermission('media', 'update'), successStoryController.updateSuccessStory);
router.delete('/:id', checkPermission('media', 'delete'), successStoryController.deleteSuccessStory);

module.exports = router;
