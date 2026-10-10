import { Request } from 'express';
import { Role } from '@prisma/client';

export interface JwtPayload {
  id: number;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  address: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface RateStoreDto {
  score: number;
  comment?: string;
}

export interface StoreQueryDto {
  search?: string;
  sortBy?: 'name' | 'address' | 'rating';
  order?: 'asc' | 'desc';
}

export interface CreateUserAdminDto {
  name: string;
  email: string;
  password: string;
  address: string;
  role: Role;
}

export interface CreateStoreDto {
  name: string;
  email: string;
  address: string;
  ownerId?: number | null;
}
