const request = require('supertest');
const app = require('../src/server');

describe('API Integration Tests', () => {
  describe('Terabox Endpoints', () => {
    describe('POST /api/terabox/info', () => {
      it('should return error for missing URL', async () => {
        const res = await request(app)
          .post('/api/terabox/info')
          .send({});
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('URL is required');
      });

      it('should return error for invalid URL', async () => {
        const res = await request(app)
          .post('/api/terabox/info')
          .send({ url: 'https://invalid-url.com' });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid Terabox URL');
      });
    });

    describe('POST /api/terabox/download', () => {
      it('should return error for missing URL', async () => {
        const res = await request(app)
          .post('/api/terabox/download')
          .send({ fileId: '12345' });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('URL and fileId are required');
      });

      it('should return error for missing fileId', async () => {
        const res = await request(app)
          .post('/api/terabox/download')
          .send({ url: 'https://teraboxapp.com/s/12345' });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('URL and fileId are required');
      });

      it('should return error for invalid URL', async () => {
        const res = await request(app)
          .post('/api/terabox/download')
          .send({ url: 'https://invalid-url.com', fileId: '12345' });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid Terabox URL');
      });
    });

    describe('POST /api/terabox/folder', () => {
      it('should return error for missing URL', async () => {
        const res = await request(app)
          .post('/api/terabox/folder')
          .send({});
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('URL is required');
      });

      it('should return error for invalid URL', async () => {
        const res = await request(app)
          .post('/api/terabox/folder')
          .send({ url: 'https://invalid-url.com' });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid Terabox URL');
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should have rate limiting headers', async () => {
      const res = await request(app).get('/');
      expect(res.headers['ratelimit-limit']).toBeDefined();
      expect(res.headers['ratelimit-remaining']).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    it('should have security headers', async () => {
      const res = await request(app).get('/');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
    });
  });
});
