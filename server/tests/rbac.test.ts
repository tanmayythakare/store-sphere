import request from 'supertest';
import app from '../src/server';
import { prisma } from '../src/prisma';

describe('Role-Based Access Control (RBAC) Integration Tests', () => {
  let adminToken: string;
  let ownerToken: string;
  let normalUserToken: string;

  beforeAll(async () => {
    // 1. Get Admin Token
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin@storesphere.com',
      password: 'Admin@1234',
    });
    adminToken = adminRes.body.token;

    // 2. Get Store Owner Token
    const ownerRes = await request(app).post('/api/auth/login').send({
      email: 'owner1@store.com',
      password: 'Owner@1234',
    });
    ownerToken = ownerRes.body.token;

    // 3. Get Normal User Token
    const userRes = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'User@1234',
    });
    normalUserToken = userRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Admin Endpoints Protection', () => {
    it('should return 403 Forbidden when normal user accesses GET /api/admin/metrics', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${normalUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Forbidden/);
    });

    it('should return 403 Forbidden when store owner accesses POST /api/admin/stores', async () => {
      const res = await request(app)
        .post('/api/admin/stores')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Unauthorized Store Attempt',
          email: 'unauthorized@store.com',
          address: 'Unauthorized Street Pune',
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Forbidden/);
    });

    it('should return 200 OK when admin accesses GET /api/admin/metrics', async () => {
      const res = await request(app)
        .get('/api/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalUsers).toBeGreaterThan(0);
      expect(res.body.totalStores).toBeGreaterThan(0);
    });
  });

  describe('Store Owner Endpoints Protection', () => {
    it('should return 403 Forbidden when normal user accesses GET /api/stores/owner/my-store', async () => {
      const res = await request(app)
        .get('/api/stores/owner/my-store')
        .set('Authorization', `Bearer ${normalUserToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 200 OK when store owner accesses GET /api/stores/owner/my-store', async () => {
      const res = await request(app)
        .get('/api/stores/owner/my-store')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.store).toBeDefined();
    });
  });

  describe('Rating Endpoint Role Restrictions', () => {
    it('should return 403 Forbidden when store owner attempts to rate a store', async () => {
      const res = await request(app)
        .post('/api/stores/1/rate')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ score: 5, comment: 'Self review' });

      expect(res.status).toBe(403);
    });

    it('should return 403 Forbidden when admin attempts to rate a store', async () => {
      const res = await request(app)
        .post('/api/stores/1/rate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ score: 5, comment: 'Admin review' });

      expect(res.status).toBe(403);
    });
  });
});
