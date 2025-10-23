const express = require('express');
const router = express.Router();
const teamMemberController = require('./team-member.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const { checkPermission } = require('../../middlewares/rbacMiddleware');

router.get('/', teamMemberController.getAllTeamMembers);
router.get('/team/:teamType', teamMemberController.getTeamMembersByType);
router.get('/:id', teamMemberController.getTeamMemberById);

router.post(
  '/',
  authMiddleware,
  checkPermission('team-members', 'create'),
  teamMemberController.createTeamMember
);

router.put(
  '/:id',
  authMiddleware,
  checkPermission('team-members', 'update'),
  teamMemberController.updateTeamMember
);

router.delete(
  '/:id',
  authMiddleware,
  checkPermission('team-members', 'delete'),
  teamMemberController.deleteTeamMember
);

module.exports = router;
