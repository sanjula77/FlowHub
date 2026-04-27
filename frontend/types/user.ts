export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

