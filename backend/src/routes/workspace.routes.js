const express = require('express');
const workspaceController = require('../controllers/workspace.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const {
  createWorkspaceSchema,
  workspaceIdSchema,
  updateWorkspaceSchema,
  deleteWorkspaceSchema,
  inviteSchema,
  updateMemberSchema,
  memberParamsSchema
} = require('../validators/workspace.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createWorkspaceSchema), workspaceController.createWorkspace);
router.get('/', workspaceController.listWorkspaces);
router.get('/:id', validate(workspaceIdSchema), workspaceController.getWorkspace);
router.put('/:id', validate(updateWorkspaceSchema), workspaceController.updateWorkspace);
router.delete('/:id', validate(deleteWorkspaceSchema), workspaceController.deleteWorkspace);
router.get('/:id/members', validate(workspaceIdSchema), workspaceController.listMembers);
router.post('/:id/invite', validate(inviteSchema), workspaceController.inviteMember);
router.put('/:id/members/:uid', validate(updateMemberSchema), workspaceController.updateMemberRole);
router.delete('/:id/members/:uid', validate(memberParamsSchema), workspaceController.removeMember);

module.exports = router;
