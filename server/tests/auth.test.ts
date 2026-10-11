import request from 'supertest';
import app from '../src/server';
import { prisma } from '../src/prisma';

describe('Auth & Validation API Integration Tests', () => {
  const testUser = {
    name: 'Suresh Digambar Kulkarni', // 24 chars
    email: 'suresh.auth.test@example.com',
    password: 'Password@123',
    address: 'Plot 42, Model Colony, Shivajinagar, Pune',
  };

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ['suresh.auth.test@example.com', 'uppercase.auth.test@example.com'] } },
    });
    await prisma.$disconnect();
  });

  describe('Registration Guardrails', () => {
    it('should reject registration when name is less than 20 characters', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...testUser,
        name: 'John Doe', // 8 chars
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/20 and 60 characters/);
    });

    it('should reject registration when name exceeds 60 characters', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...testUser,
        name: 'Alexander Montgomery Pierce the Third of the Royal Household of Westminster London',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/20 and 60 characters/);
    });

    it('should reject registration when password lacks uppercase letter', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...testUser,
        password: 'password@123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/uppercase/);
    });

    it('should reject registration when password lacks special character', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...testUser,
        password: 'Password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/special character/);
    });

    it('should reject registration when password is shorter than 8 characters', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...testUser,
        password: 'P@123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/8 to 16 characters/);
    });

    it('should successfully register a valid user and enforce lowercase email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...testUser,
        email: 'UPPERCASE.AUTH.TEST@EXAMPLE.COM',
      });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('uppercase.auth.test@example.com');
      expect(res.body.token).toBeDefined();
    });

    it('should reject duplicate email registration with 409 Conflict', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...testUser,
        email: 'uppercase.auth.test@example.com',
      });

      expect(res.status).toBe(409);
    });
  });

  describe('Login & Session Management', () => {
    it('should successfully log in with seeded admin credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@storesphere.com',
        password: 'Admin@1234',
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('ADMIN');
    });

    it('should reject invalid password with generic 401 response', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@storesphere.com',
        password: 'WrongPassword@999',
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password.');
    });

    it('should return 401 when accessing /api/auth/me without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should return authenticated user profile when token provided', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'admin@storesphere.com',
        password: 'Admin@1234',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('admin@storesphere.com');
    });
  });
});
