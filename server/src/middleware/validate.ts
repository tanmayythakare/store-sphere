import { Request, Response, NextFunction } from 'express';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]).{8,16}$/;

export function validateRegister(req: Request, res: Response, next: NextFunction) {
  let { name, email, password, address } = req.body;

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

  // Normalize inputs (strictly lowercase email)
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.address = address.trim();

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({
      error: 'Email and password are required.',
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
}

export function validateChangePassword(req: Request, res: Response, next: NextFunction) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || typeof currentPassword !== 'string') {
    return res.status(400).json({
      error: 'Current password is required.',
    });
  }

  if (!newPassword || typeof newPassword !== 'string' || !PASSWORD_REGEX.test(newPassword)) {
    return res.status(400).json({
      error: 'New password must be 8 to 16 characters long and contain at least one uppercase letter and one special character.',
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      error: 'New password cannot be identical to the current password.',
    });
  }

  next();
}
