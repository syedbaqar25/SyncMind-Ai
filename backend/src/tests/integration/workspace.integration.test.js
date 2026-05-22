const request = require('supertest');
const app = require('../../app');

describe('workspace routes', () => {
  test('GET /api/workspaces 401 unauthenticated', async () => {
    await request(app).get('/api/workspaces').expect(401);
  });

  test('POST /api/workspaces 401 unauthenticated', async () => {
    await request(app).post('/api/workspaces').send({ name: 'Team' }).expect(401);
  });

  test('GET /api/workspaces/:id 401 unauthenticated', async () => {
    await request(app).get('/api/workspaces/w1').expect(401);
  });

  test('POST /api/workspaces/:id/invite 401 unauthenticated', async () => {
    await request(app).post('/api/workspaces/w1/invite').send({ email: 'a@test.com' }).expect(401);
  });

  test('DELETE /api/workspaces/:id/members/:uid 401 unauthenticated', async () => {
    await request(app).delete('/api/workspaces/w1/members/u1').expect(401);
  });
});
