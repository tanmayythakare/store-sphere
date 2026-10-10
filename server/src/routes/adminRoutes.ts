import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getMetrics,
  getAllUsers,
  createUser,
  getAllStores,
  createStore,
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Apply ADMIN guard to all routes in this router
router.use(authenticateToken, requireRole(Role.ADMIN));

router.get('/metrics', getMetrics);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.get('/stores', getAllStores);
router.post('/stores', createStore);

export default router;
