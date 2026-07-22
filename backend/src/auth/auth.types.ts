import { Request } from 'express';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: string[];
  type: 'access';
}

export interface AuthenticatedUser extends AccessTokenPayload {
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
