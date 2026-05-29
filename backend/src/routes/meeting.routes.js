const express = require('express');
const meetingController = require('../controllers/meeting.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadLimiter, aiLimiter } = require('../middleware/rateLimit.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const {
  meetingListSchema,
  createMeetingSchema,
  searchMeetingSchema,
  meetingIdSchema,
  updateMeetingSchema,
  createActionItemSchema,
  updateActionItemSchema,
  actionItemParamsSchema,
  askMeetingSchema
} = require('../validators/meeting.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', validate(meetingListSchema), meetingController.listMeetings);
router.post(
  '/',
  uploadLimiter,
  upload.single('file'),
  handleUploadError,
  validate(createMeetingSchema),
  meetingController.createMeeting
);
router.get('/search', validate(searchMeetingSchema), meetingController.searchMeetings);
router.get('/:id', validate(meetingIdSchema), meetingController.getMeeting);
router.put('/:id', validate(updateMeetingSchema), meetingController.updateMeeting);
router.delete('/:id', validate(meetingIdSchema), meetingController.deleteMeeting);
router.post('/:id/process', validate(meetingIdSchema), meetingController.processMeeting);
router.get('/:id/transcript', validate(meetingIdSchema), meetingController.getTranscript);
router.get('/:id/summary', validate(meetingIdSchema), meetingController.getSummary);
router.get('/:id/action-items', validate(meetingIdSchema), meetingController.listActionItems);
router.post('/:id/action-items', validate(createActionItemSchema), meetingController.createActionItem);
router.put('/:id/action-items/:aid', validate(updateActionItemSchema), meetingController.updateActionItem);
router.delete('/:id/action-items/:aid', validate(actionItemParamsSchema), meetingController.deleteActionItem);
router.post('/:id/ask', aiLimiter, validate(askMeetingSchema), meetingController.askMeeting);

module.exports = router;
