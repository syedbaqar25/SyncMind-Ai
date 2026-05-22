process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_for_jest_only';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_jest_only';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES = '7d';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.RESEND_API_KEY = 'test_resend_key';
process.env.OPENAI_API_KEY = 'test_openai_key';
process.env.PINECONE_API_KEY = 'test_pinecone_key';
process.env.PINECONE_INDEX = 'test-index';

jest.mock('openai', () => jest.fn());
jest.mock('@pinecone-database/pinecone', () => ({
  Pinecone: jest.fn().mockImplementation(() => ({ index: jest.fn() }))
}));
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({ emails: { send: jest.fn().mockResolvedValue({ id: 'email_1' }) } }))
}));
