import { Role } from '../../src/generated/prisma/client';

export type RegisterResponseBody = {
  email: string;
  name: string;
  password?: string;
};

export type LoginResponseBody = {
  access_token: string;
};

export type CurrentUserResponseBody = {
  id: number;
  email: string;
  role: Role;
};

export type ReviewResponseBody = {
  id: number;
  text: string;
  rating: number;
  movieId: number;
  userId: number;
};

export type ErrorResponseBody = {
  message: string | string[];
};
