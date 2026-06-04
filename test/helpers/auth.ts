import request from 'supertest';
import { Role } from '../../src/generated/prisma/client';
import { E2EContext } from './e2e-app';
import { LoginResponseBody } from './response-types';

export type AuthSession = {
  email: string;
  token: string;
};

export const createTestEmail = (ctx: E2EContext) => {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

  ctx.testEmails.push(email);

  return email;
};

export const registerAndLogin = async (
  ctx: E2EContext,
  name = 'E2E User',
  role: Role = Role.USER,
): Promise<AuthSession> => {
  const email = createTestEmail(ctx);

  await request(ctx.httpApp)
    .post('/auth/register')
    .send({
      email,
      password: 'password123',
      name,
    })
    .expect(201);

  if (role !== Role.USER) {
    await ctx.prisma.user.update({
      where: { email },
      data: { role },
    });
  }

  const loginResponse = await request(ctx.httpApp)
    .post('/auth/login')
    .send({
      email,
      password: 'password123',
    })
    .expect(201);
  const loginResponseBody = loginResponse.body as LoginResponseBody;

  return {
    email,
    token: loginResponseBody.access_token,
  };
};
