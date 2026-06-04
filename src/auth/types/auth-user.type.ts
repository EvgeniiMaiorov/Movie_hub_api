import type { Role } from '../../generated/prisma/client';

export type AuthUser = {
  id: number;
  email: string;
  role: Role;
};
