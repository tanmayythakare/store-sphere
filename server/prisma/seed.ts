import dotenv from 'dotenv';
dotenv.config({ override: true });

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL?.startsWith('postgresql://')
  ? process.env.DATABASE_URL
  : 'postgresql://postgres:postgres@localhost:5432/storedb?schema=public';

process.env.DATABASE_URL = databaseUrl;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function main() {
  console.log('Seeding database with test users and stores...');

  // Clean existing records in reverse dependency order
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  // Password hashes (bcrypt salt rounds = 10)
  const adminPassword = await bcrypt.hash('Admin@1234', 10);
  const ownerPassword = await bcrypt.hash('Owner@1234', 10);
  const userPassword = await bcrypt.hash('User@1234', 10);

  // 1. Seed Users (all names strictly 20 to 60 characters)
  const admin = await prisma.user.create({
    data: {
      name: 'Alexander Montgomery Pierce', // 28 chars
      email: 'admin@storesphere.com',
      password: adminPassword,
      address: '704 Yashada Business Zone, Baner, Pune',
      role: Role.ADMIN,
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      name: 'Rameshwar Shrikant Kulkarni', // 27 chars
      email: 'owner1@store.com',
      password: ownerPassword,
      address: 'Ganraj Chowk, Baner Road, Pune',
      role: Role.STORE_OWNER,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Siddharth Vikramaditya Patil', // 28 chars
      email: 'owner2@store.com',
      password: ownerPassword,
      address: 'High Street, Balewadi, Pune',
      role: Role.STORE_OWNER,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'Tanmay Ravindra Thakare', // 22 chars
      email: 'user@example.com',
      password: userPassword,
      address: 'Hinjewadi Phase 1, Pune',
      role: Role.NORMAL_USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Priyanka Chandrakant Deshmukh', // 29 chars
      email: 'priyanka@example.com',
      password: userPassword,
      address: 'Aundh IT Park, Pune',
      role: Role.NORMAL_USER,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Abhishek Dnyaneshwar Shinde', // 27 chars
      email: 'abhishek@example.com',
      password: userPassword,
      address: 'Kothrud Depot, Pune',
      role: Role.NORMAL_USER,
    },
  });

  console.log(`Created 6 users: ${admin.email}, ${owner1.email}, ${owner2.email}, ${user1.email}, ${user2.email}, ${user3.email}`);

  // 2. Seed Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Nexus Supermarket Baner',
      email: 'nexus@baner.store',
      address: 'Ganraj Chowk, Baner Road, Pune',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Aura Organic Essentials',
      email: 'aura@balewadi.store',
      address: 'High Street, Balewadi, Pune',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Phoenix Tech Electronics',
      email: 'phoenix@tech.store',
      address: 'Phoenix Marketcity, Viman Nagar, Pune',
      ownerId: null, // Unassigned
    },
  });

  console.log(`Created 3 stores: ${store1.name}, ${store2.name}, ${store3.name}`);

  // 3. Seed Ratings (1 per user per store)
  await prisma.rating.create({
    data: {
      score: 5,
      comment: 'Excellent customer service and fresh produce!',
      userId: user1.id,
      storeId: store1.id,
    },
  });

  await prisma.rating.create({
    data: {
      score: 4,
      comment: 'Great variety, but parking can be crowded.',
      userId: user2.id,
      storeId: store1.id,
    },
  });

  await prisma.rating.create({
    data: {
      score: 4,
      comment: 'Top quality organic groceries.',
      userId: user2.id,
      storeId: store2.id,
    },
  });

  console.log('Seeded ratings successfully. Initial ratings ready for testing!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
