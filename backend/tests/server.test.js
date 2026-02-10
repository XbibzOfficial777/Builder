const request = require('supertest');
const app = require('../src/server');

describe('Server', () => {
  describe('GET /', () => {
    it('should return API info', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Terabox Downloader API');
      expect(res.body.version).toBe('1.0.0');
      expect(res.body.endpoints).toBeDefined();
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/unknown-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Endpoint not found');
    });
  });
});
