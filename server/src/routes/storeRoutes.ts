import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getStores,
  rateStore,
  getOwnerStore,
  getStoreReviews,
} from '../controllers/storeController';
import {
  authenticateToken,
  optionalAuthenticateToken,
  requireRole,
} from '../middleware/auth';

const router = Router();

// Store Catalog & Search (with optional user context for personal rating)
router.get('/', optionalAuthenticateToken, getStores);

// Rating Submission / Instant Modify (NORMAL_USER only)
router.post('/:id/rate', authenticateToken, requireRole(Role.NORMAL_USER), rateStore);

// Store Owner Portal Endpoints (STORE_OWNER only)
router.get('/owner/my-store', authenticateToken, requireRole(Role.STORE_OWNER), getOwnerStore);
router.get('/owner/reviews', authenticateToken, requireRole(Role.STORE_OWNER), getStoreReviews);

export default router;
