const required = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'OPENAI_API_KEY',
  'PINECONE_API_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'RESEND_API_KEY'
];

const validateEnv = () => {
  required.forEach((key) => {
    if (!process.env[key]) {
      console.error(`FATAL: Missing required env var: ${key}`);
      process.exit(1);
    }
  });
};

module.exports = validateEnv;
