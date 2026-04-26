import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
        sub?: string;
        email?: string;
        roles?: string[];
        scope?: string;
        apiContext?: string;
        apiVersion?: string;
        token?: string;
      };
      requestId?: string;
    }
  }
}
