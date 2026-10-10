export type Role = 'ADMIN' | 'STORE_OWNER' | 'NORMAL_USER';

export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt?: string;
  store?: {
    id: number;
    name: string;
    address: string;
    averageRating: number | null;
  } | null;
}

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  averageRating: number | null;
  ratingCount: number;
  userRating?: {
    score: number;
    comment: string | null;
  } | null;
  owner?: {
    id: number;
    name: string;
    email: string;
  } | null;
  createdAt?: string;
}

export interface Review {
  id: number;
  score: number;
  comment: string | null;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}
