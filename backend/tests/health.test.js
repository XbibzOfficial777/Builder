const request = require('supertest');
const app = require('../src/server');

describe('Health API', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('healthy');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeDefined();
      expect(res.body.environment).toBeDefined();
      expect(res.body.version).toBe('1.0.0');
    });
  });
});
