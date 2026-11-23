import { Request } from "express";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
