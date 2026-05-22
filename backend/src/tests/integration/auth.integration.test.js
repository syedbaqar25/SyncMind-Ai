const request = require('supertest');
const app = require('../../app');

describe('auth routes', () => {
  test('GET /api/health 200', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body.data.status).toBe('ok');
  });

  test('POST /api/auth/register 400 invalid email', async () => {
    await request(app).post('/api/auth/register').send({ email: 'bad', name: 'Test', password: 'password123' }).expect(400);
  });

  test('POST /api/auth/register 400 short password', async () => {
    await request(app).post('/api/auth/register').send({ email: 'test@test.com', name: 'Test', password: 'short' }).expect(400);
  });

  test('POST /api/auth/login 400 invalid email', async () => {
    await request(app).post('/api/auth/login').send({ email: 'bad', password: 'password123' }).expect(400);
  });

  test('POST /api/auth/login 400 missing password', async () => {
    await request(app).post('/api/auth/login').send({ email: 'test@test.com' }).expect(400);
  });

  test('POST /api/auth/refresh 400 missing token', async () => {
    await request(app).post('/api/auth/refresh').send({}).expect(400);
  });

  test('POST /api/auth/logout 400 missing token', async () => {
    await request(app).post('/api/auth/logout').send({}).expect(400);
  });

  test('POST /api/auth/forgot-password 400 invalid email', async () => {
    await request(app).post('/api/auth/forgot-password').send({ email: 'bad' }).expect(400);
  });

  test('GET /api/auth/me 401 no token', async () => {
    await request(app).get('/api/auth/me').expect(401);
  });
});
