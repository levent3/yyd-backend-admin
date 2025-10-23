const express = require('express');
const router = express.Router();
const timelineController = require('./timeline.controller');
const { authenticate } = require('../../middlewares/authMiddleware');
const { authorizePermission } = require('../../middlewares/permissionMiddleware');

/**
 * @route   GET /api/timelines
 * @desc    Get all timeline events (with pagination, filtering)
 * @access  Public
 */
router.get('/', timelineController.getAllTimelines);

/**
 * @route   GET /api/timelines/year/:year
 * @desc    Get timelines by year
 * @access  Public
 */
router.get('/year/:year', timelineController.getTimelinesByYear);

/**
 * @route   GET /api/timelines/:id
 * @desc    Get timeline by ID
 * @access  Public
 */
router.get('/:id', timelineController.getTimelineById);

/**
 * @route   POST /api/timelines
 * @desc    Create new timeline
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authenticate,
  authorizePermission('timeline', 'create'),
  timelineController.createTimeline
);

/**
 * @route   PUT /api/timelines/:id
 * @desc    Update timeline
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authenticate,
  authorizePermission('timeline', 'update'),
  timelineController.updateTimeline
);

/**
 * @route   DELETE /api/timelines/:id
 * @desc    Delete timeline
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorizePermission('timeline', 'delete'),
  timelineController.deleteTimeline
);

module.exports = router;
