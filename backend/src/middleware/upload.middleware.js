const multer = require('multer');
const { errorResponse } = require('../utils/response.utils');

const MAX_FILE_SIZE = 500 * 1024 * 1024;

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
      return cb(null, true);
    }

    return cb(new Error('Only audio and video files are allowed'));
  }
});

const handleUploadError = (error, req, res, next) => {
  if (!error) return next();

  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 'File size exceeds 500MB limit', 400);
  }

  return errorResponse(res, error.message || 'File upload failed', 400);
};

module.exports = {
  upload,
  handleUploadError
};
