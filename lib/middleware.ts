import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, isAdmin, JWTPayload } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// Middleware: Require authentication
export function requireAuth<T = any>(
  handler: (req: AuthenticatedRequest, context?: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: T) => {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }
    
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = user;
    
    return handler(authenticatedReq, context);
  };
}

// Middleware: Require admin role
export function requireAdmin<T = any>(
  handler: (req: AuthenticatedRequest, context?: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: T) => {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }
    
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }
    
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = user;
    
    return handler(authenticatedReq, context);
  };
}

