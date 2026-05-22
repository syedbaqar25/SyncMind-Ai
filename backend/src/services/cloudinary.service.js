const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

const uploadMeetingFile = async (file, folder = 'syncmind/meetings') => {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'auto';
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

const deleteCloudinaryAsset = async (publicId, resourceType = 'video') => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = {
  uploadMeetingFile,
  deleteCloudinaryAsset
};
