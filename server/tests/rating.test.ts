import request from 'supertest';
import app from '../src/server';
import { prisma } from '../src/prisma';

describe('Store Rating & Upsert Integration Tests', () => {
  let userToken: string;
  let targetStoreId: number;
  let testUserId: number;

  beforeAll(async () => {
    // 1. Get Normal User Token (abhishek@example.com - initially has 0 ratings)
    const userRes = await request(app).post('/api/auth/login').send({
      email: 'abhishek@example.com',
      password: 'User@1234',
    });
    userToken = userRes.body.token;
    testUserId = userRes.body.user.id;

    // 2. Fetch a valid store
    const store = await prisma.store.findFirst();
    if (!store) throw new Error('No store found in database');
    targetStoreId = store.id;

    // Ensure test user has no rating for target store initially
    await prisma.rating.deleteMany({
      where: { userId: testUserId, storeId: targetStoreId },
    });
  });

  afterAll(async () => {
    await prisma.rating.deleteMany({
      where: { userId: testUserId, storeId: targetStoreId },
    });
    await prisma.$disconnect();
  });

  describe('Rating Validation Rules', () => {
    it('should reject rating score lower than 1', async () => {
      const res = await request(app)
        .post(`/api/stores/${targetStoreId}/rate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ score: 0 });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/between 1 and 5/);
    });

    it('should reject rating score higher than 5', async () => {
      const res = await request(app)
        .post(`/api/stores/${targetStoreId}/rate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ score: 6 });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/between 1 and 5/);
    });

    it('should reject feedback comments exceeding 100 characters', async () => {
      const longComment = 'This is an excessively detailed review that intentionally goes beyond the allowed maximum of one hundred characters limit.'.slice(0, 105);

      const res = await request(app)
        .post(`/api/stores/${targetStoreId}/rate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ score: 5, comment: longComment });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/100 characters/);
    });
  });

  describe('Rating Upsert & Instant Modify Logic', () => {
    it('should successfully submit initial 5-star rating with comment', async () => {
      const res = await request(app)
        .post(`/api/stores/${targetStoreId}/rate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ score: 5, comment: 'Phenomenal experience!' });

      expect(res.status).toBe(200);
      expect(res.body.rating.score).toBe(5);
      expect(res.body.rating.comment).toBe('Phenomenal experience!');
      expect(res.body.averageRating).toBeDefined();

      // Verify exactly 1 rating in DB for this user + store
      const count = await prisma.rating.count({
        where: { userId: testUserId, storeId: targetStoreId },
      });
      expect(count).toBe(1);
    });

    it('should update existing rating score to 3 stars without creating a duplicate record', async () => {
      const res = await request(app)
        .post(`/api/stores/${targetStoreId}/rate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ score: 3, comment: 'Updated review: service was a bit slow today.' });

      expect(res.status).toBe(200);
      expect(res.body.rating.score).toBe(3);
      expect(res.body.rating.comment).toBe('Updated review: service was a bit slow today.');

      // Check DB count remains strictly 1 (upsert guarantee)
      const count = await prisma.rating.count({
        where: { userId: testUserId, storeId: targetStoreId },
      });
      expect(count).toBe(1);

      // Verify database record has updated score
      const updatedRecord = await prisma.rating.findUnique({
        where: { userId_storeId: { userId: testUserId, storeId: targetStoreId } },
      });
      expect(updatedRecord?.score).toBe(3);
    });
  });

  describe('Store Catalog & Search Endpoints', () => {
    it('should return stores matching case-insensitive search query', async () => {
      const res = await request(app).get('/api/stores?search=nexus');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.stores)).toBe(true);
      if (res.body.stores.length > 0) {
        expect(res.body.stores[0].name.toLowerCase()).toContain('nexus');
      }
    });

    it('should attach userRating when requested with authenticated user token', async () => {
      const res = await request(app)
        .get('/api/stores')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      const store = res.body.stores.find((s: any) => s.id === targetStoreId);
      expect(store).toBeDefined();
      expect(store.userRating).toBeDefined();
      expect(store.userRating.score).toBe(3);
    });
  });
});
