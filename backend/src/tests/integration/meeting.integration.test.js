const request = require('supertest');
const app = require('../../app');

describe('meeting routes', () => {
  test('GET /api/meetings 401 unauthenticated', async () => {
    await request(app).get('/api/meetings?workspaceId=w1').expect(401);
  });

  test('POST /api/meetings 401 unauthenticated', async () => {
    await request(app).post('/api/meetings').expect(401);
  });

  test('GET /api/meetings/search 401 unauthenticated', async () => {
    await request(app).get('/api/meetings/search?workspaceId=w1&q=roadmap').expect(401);
  });

  test('GET /api/meetings/:id 401 unauthenticated', async () => {
    await request(app).get('/api/meetings/m1').expect(401);
  });

  test('PUT /api/meetings/:id 401 unauthenticated', async () => {
    await request(app).put('/api/meetings/m1').send({ title: 'New' }).expect(401);
  });

  test('DELETE /api/meetings/:id 401 unauthenticated', async () => {
    await request(app).delete('/api/meetings/m1').expect(401);
  });

  test('GET /api/meetings/:id/transcript 401 unauthenticated', async () => {
    await request(app).get('/api/meetings/m1/transcript').expect(401);
  });

  test('POST /api/meetings/:id/ask 401 unauthenticated', async () => {
    await request(app).post('/api/meetings/m1/ask').send({ question: 'What happened?' }).expect(401);
  });
});
