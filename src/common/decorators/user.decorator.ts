import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserPayload } from '../interfaces/user-payload.interface';

export const User = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    // Ensure that request.user is correctly typed by the guard or interceptor
    // For now, we cast it to UserPayload
    const user = request.user as UserPayload;

    return data ? user?.[data] : user;
  },
);
