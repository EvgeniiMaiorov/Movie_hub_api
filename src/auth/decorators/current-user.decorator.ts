import { createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import type { AuthUser } from '../types/auth-user.type';

type RequestWithUser = Request & {
  user: AuthUser;
};

export const CurrentUser = createParamDecorator<undefined, AuthUser>(
  (_data, ctx) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    return request.user;
  },
);
