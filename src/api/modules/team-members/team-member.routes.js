const express = require('express');
const router = express.Router();
const teamMemberController = require('./team-member.controller');
const { authenticate } = require('../../middlewares/authMiddleware');
const { authorizePermission } = require('../../middlewares/permissionMiddleware');

router.get('/', teamMemberController.getAllTeamMembers);
router.get('/team/:teamType', teamMemberController.getTeamMembersByType);
router.get('/:id', teamMemberController.getTeamMemberById);

router.post(
  '/',
  authenticate,
  authorizePermission('team-member', 'create'),
  teamMemberController.createTeamMember
);

router.put(
  '/:id',
  authenticate,
  authorizePermission('team-member', 'update'),
  teamMemberController.updateTeamMember
);

router.delete(
  '/:id',
  authenticate,
  authorizePermission('team-member', 'delete'),
  teamMemberController.deleteTeamMember
);

module.exports = router;
