import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthenticatedRequest, RateStoreDto } from '../types';

export async function getStores(req: AuthenticatedRequest, res: Response) {
  try {
    const search = (req.query.search as string)?.trim() || '';
    const sortBy = (req.query.sortBy as string) || 'name';
    const order = (req.query.order as string)?.toLowerCase() === 'desc' ? 'desc' : 'asc';
    const currentUserId = req.user?.id;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        ratings: {
          select: {
            id: true,
            score: true,
            comment: true,
            userId: true,
            updatedAt: true,
          },
        },
      },
    });

    const formattedStores = stores.map((store) => {
      const ratingCount = store.ratings.length;
      const averageRating =
        ratingCount > 0
          ? parseFloat(
              (
                store.ratings.reduce((acc, curr) => acc + curr.score, 0) / ratingCount
              ).toFixed(1)
            )
          : null;

      let userRating: { score: number; comment: string | null } | null = null;
      if (currentUserId) {
        const found = store.ratings.find((r) => r.userId === currentUserId);
        if (found) {
          userRating = { score: found.score, comment: found.comment };
        }
      }

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        ratingCount,
        userRating,
      };
    });

    // In-memory sorting for dynamic table columns
    formattedStores.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
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
    console.error('getStores error:', error);
    return res.status(500).json({ error: 'Internal server error fetching stores.' });
  }
}

export async function rateStore(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const storeId = parseInt(req.params.id as string, 10);
    if (isNaN(storeId)) {
      return res.status(400).json({ error: 'Invalid store ID provided.' });
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    const { score, comment }: RateStoreDto = req.body;
    const numericScore = Number(score);

    if (!Number.isInteger(numericScore) || numericScore < 1 || numericScore > 5) {
      return res.status(400).json({
        error: 'Rating score must be an integer between 1 and 5.',
      });
    }

    const sanitizedComment =
      typeof comment === 'string' && comment.trim().length > 0
        ? comment.trim()
        : null;

    if (sanitizedComment && sanitizedComment.length > 100) {
      return res.status(400).json({
        error: 'Feedback comment must not exceed 100 characters in length.',
      });
    }

    // Instant upsert on @@unique([userId, storeId]) - allows instant modify without cooldowns
    const rating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId: req.user.id,
          storeId,
        },
      },
      update: {
        score: numericScore,
        comment: sanitizedComment,
      },
      create: {
        userId: req.user.id,
        storeId,
        score: numericScore,
        comment: sanitizedComment,
      },
    });

    // Compute updated average
    const aggregate = await prisma.rating.aggregate({
      where: { storeId },
      _avg: { score: true },
      _count: { score: true },
    });

    const averageRating = aggregate._avg.score
      ? parseFloat(aggregate._avg.score.toFixed(1))
      : null;

    return res.status(200).json({
      message: 'Rating recorded successfully.',
      rating: {
        id: rating.id,
        score: rating.score,
        comment: rating.comment,
      },
      averageRating,
      ratingCount: aggregate._count.score,
    });
  } catch (error) {
    console.error('rateStore error:', error);
    return res.status(500).json({ error: 'Internal server error submitting rating.' });
  }
}

export async function getOwnerStore(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const store = await prisma.store.findFirst({
      where: { ownerId: req.user.id },
      include: {
        ratings: {
          select: { score: true },
        },
      },
    });

    if (!store) {
      return res.status(200).json({ store: null });
    }

    const totalRatings = store.ratings.length;
    const averageRating =
      totalRatings > 0
        ? parseFloat(
            (store.ratings.reduce((acc, curr) => acc + curr.score, 0) / totalRatings).toFixed(1)
          )
        : null;

    return res.status(200).json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings,
      },
    });
  } catch (error) {
    console.error('getOwnerStore error:', error);
    return res.status(500).json({ error: 'Internal server error fetching store details.' });
  }
}

export async function getStoreReviews(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const sortBy = (req.query.sortBy as string) || 'date';
    const order = (req.query.order as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const store = await prisma.store.findFirst({
      where: { ownerId: req.user.id },
    });

    if (!store) {
      return res.status(404).json({ error: 'No store associated with this account.' });
    }

    const reviews = await prisma.rating.findMany({
      where: { storeId: store.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            // STRICT PRIVACY: User home address and password hash are NEVER exposed to store owners
          },
        },
      },
      orderBy:
        sortBy === 'score'
          ? { score: order }
          : { updatedAt: order },
    });

    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      score: r.score,
      comment: r.comment,
      updatedAt: r.updatedAt,
      customerName: r.user.name,
      customerEmail: r.user.email,
    }));

    return res.status(200).json({
      storeName: store.name,
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error('getStoreReviews error:', error);
    return res.status(500).json({ error: 'Internal server error fetching store reviews.' });
  }
}
