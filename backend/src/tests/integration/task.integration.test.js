const request = require('supertest');
const app = require('../../app');

describe('task routes', () => {
  test('GET /api/tasks 401 unauthenticated', async () => {
    await request(app).get('/api/tasks?workspaceId=w1').expect(401);
  });

  test('GET /api/tasks/my-tasks 401 unauthenticated', async () => {
    await request(app).get('/api/tasks/my-tasks').expect(401);
  });

  test('GET /api/tasks/overdue 401 unauthenticated', async () => {
    await request(app).get('/api/tasks/overdue?workspaceId=w1').expect(401);
  });

  test('PUT /api/tasks/:id 401 unauthenticated', async () => {
    await request(app).put('/api/tasks/t1').send({ status: 'DONE' }).expect(401);
  });
});
