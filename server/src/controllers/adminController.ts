import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../prisma';
import { AuthenticatedRequest, CreateUserAdminDto, CreateStoreDto } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{8,16}$/;

export async function getMetrics(_req: AuthenticatedRequest, res: Response) {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    return res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error) {
    console.error('getMetrics error:', error);
    return res.status(500).json({ error: 'Internal server error fetching system metrics.' });
  }
}

export async function getAllUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const search = (req.query.search as string)?.trim() || '';
    const roleFilter = req.query.role as Role | undefined;
    const sortBy = (req.query.sortBy as string) || 'name';
    const order = (req.query.order as string)?.toLowerCase() === 'desc' ? 'desc' : 'asc';

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleFilter && Object.values(Role).includes(roleFilter)) {
      whereClause.role = roleFilter;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        ownedStores: {
          select: {
            id: true,
            name: true,
            address: true,
            ratings: {
              select: { score: true },
            },
          },
        },
      },
      orderBy:
        sortBy === 'name' || sortBy === 'email' || sortBy === 'address' || sortBy === 'role' || sortBy === 'createdAt'
          ? { [sortBy]: order }
          : { name: 'asc' },
    });

    const formattedUsers = users.map((user) => {
      let storeInfo: { id: number; name: string; address: string; averageRating: number | null } | null = null;

      if (user.role === Role.STORE_OWNER && user.ownedStores.length > 0) {
        const store = user.ownedStores[0];
        const ratingCount = store.ratings.length;
        const averageRating =
          ratingCount > 0
            ? parseFloat(
                (store.ratings.reduce((acc, curr) => acc + curr.score, 0) / ratingCount).toFixed(1)
              )
            : null;

        storeInfo = {
          id: store.id,
          name: store.name,
          address: store.address,
          averageRating,
        };
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        store: storeInfo,
      };
    });

    return res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ error: 'Internal server error fetching user directory.' });
  }
}

export async function createUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, email, password, address, role }: CreateUserAdminDto = req.body;

    if (typeof name !== 'string' || name.trim().length < 20 || name.trim().length > 60) {
      return res.status(400).json({
        error: 'Full Name must be between 20 and 60 characters in length.',
      });
    }

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        error: 'A valid email address is required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        error: 'Password must be 8 to 16 characters long and contain at least one uppercase letter and one special character.',
      });
    }

    if (typeof address !== 'string' || address.trim().length === 0 || address.trim().length > 400) {
      return res.status(400).json({
        error: 'Address is required and must not exceed 400 characters in length.',
      });
    }

    if (!role || !Object.values(Role).includes(role)) {
      return res.status(400).json({
        error: 'Valid role must be specified (ADMIN, STORE_OWNER, or NORMAL_USER).',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email address already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        address: address.trim(),
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: 'User created successfully.',
      user,
    });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({ error: 'Internal server error creating user.' });
  }
}

export async function getAllStores(req: AuthenticatedRequest, res: Response) {
  try {
    const search = (req.query.search as string)?.trim() || '';
    const sortBy = (req.query.sortBy as string) || 'name';
    const order = (req.query.order as string)?.toLowerCase() === 'desc' ? 'desc' : 'asc';

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          select: { score: true },
        },
      },
    });

    const formattedStores = stores.map((store) => {
      const ratingCount = store.ratings.length;
      const averageRating =
        ratingCount > 0
          ? parseFloat(
              (store.ratings.reduce((acc, curr) => acc + curr.score, 0) / ratingCount).toFixed(1)
            )
          : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
        averageRating,
        ratingCount,
        createdAt: store.createdAt,
      };
    });

    formattedStores.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'email') {
        comparison = a.email.localeCompare(b.email);
      } else if (sortBy === 'address') {
        comparison = a.address.localeCompare(b.address);
      } else if (sortBy === 'rating') {
        const scoreA = a.averageRating ?? -1;
        const scoreB = b.averageRating ?? -1;
        comparison = scoreA - scoreB;
      }
      return order === 'desc' ? -comparison : comparison;
    });

    return res.status(200).json({ stores: formattedStores });
  } catch (error) {
    console.error('getAllStores error:', error);
    return res.status(500).json({ error: 'Internal server error fetching stores.' });
  }
}

export async function createStore(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, email, address, ownerId }: CreateStoreDto = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Store name is required.' });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'A valid store email address is required.' });
    }

    if (!address || typeof address !== 'string' || address.trim().length === 0 || address.trim().length > 400) {
      return res.status(400).json({ error: 'Store address is required and must not exceed 400 characters.' });
    }

    const trimmedName = name.trim();
    const trimmedAddress = address.trim();

    // Check unique constraint [name, address]
    const existingStore = await prisma.store.findUnique({
      where: {
        name_address: {
          name: trimmedName,
          address: trimmedAddress,
        },
      },
    });

    if (existingStore) {
      return res.status(409).json({
        error: 'A store with this name and address already exists.',
      });
    }

    let validOwnerId: number | null = null;
    if (ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: Number(ownerId) },
      });

      if (!owner) {
        return res.status(404).json({ error: 'Specified store owner user not found.' });
      }

      if (owner.role !== Role.STORE_OWNER) {
        return res.status(400).json({
          error: 'Assigned store owner must have the STORE_OWNER role.',
        });
      }

      validOwnerId = owner.id;
    }

    const newStore = await prisma.store.create({
      data: {
        name: trimmedName,
        email: email.trim().toLowerCase(),
        address: trimmedAddress,
        ownerId: validOwnerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: 'Store registered successfully.',
      store: newStore,
    });
  } catch (error) {
    console.error('createStore error:', error);
    return res.status(500).json({ error: 'Internal server error registering store.' });
  }
}
