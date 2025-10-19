import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'cursor-vip-secret-key-2024';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'customer';
}

// Tạo JWT token
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Get user from request
export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Check if user is admin
export function isAdmin(user: JWTPayload | null): boolean {
  return user?.role === 'admin';
}

// Check if user is customer
export function isCustomer(user: JWTPayload | null): boolean {
  return user?.role === 'customer';
}

