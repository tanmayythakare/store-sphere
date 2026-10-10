import { Router } from 'express';
import { register, login, getMe, changePassword } from '../controllers/authController';
import { validateRegister, validateLogin, validateChangePassword } from '../middleware/validate';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticateToken, getMe);
router.post('/change-password', authenticateToken, validateChangePassword, changePassword);

export default router;
