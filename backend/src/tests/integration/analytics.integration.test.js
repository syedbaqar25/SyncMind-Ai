const request = require('supertest');
const app = require('../../app');

describe('analytics routes', () => {
  test('GET /api/analytics/overview 401 unauthenticated', async () => {
    await request(app).get('/api/analytics/overview?workspaceId=w1').expect(401);
  });

  test('GET /api/analytics/meetings-over-time 401 unauthenticated', async () => {
    await request(app).get('/api/analytics/meetings-over-time?workspaceId=w1').expect(401);
  });

  test('GET /api/analytics/task-completion 401 unauthenticated', async () => {
    await request(app).get('/api/analytics/task-completion?workspaceId=w1').expect(401);
  });
}
);
