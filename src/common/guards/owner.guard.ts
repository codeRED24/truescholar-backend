import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { UserPayload } from '../../common/interfaces/user-payload.interface';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as UserPayload; // User from RefreshAuthGuard
    const userIdParam = parseInt(request.params.id, 10);

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (isNaN(userIdParam)) {
      // If the ID parameter is not a number, it might be a different type of identifier
      // or an invalid request. For now, we'll treat it as forbidden if it's not the authenticated user's ID.
      // A more robust solution might involve checking if the parameter is 'me' or another keyword.
      // For simplicity, we'll assume 'id' refers to the numeric user ID.
      throw new ForbiddenException('Invalid user ID parameter');
    }

    // Allow access if the authenticated user's ID matches the ID in the URL parameter
    if (user.userId === userIdParam) {
      return true;
    }

    // For the /profile/:id endpoint, if the ID is not 'me' and not the user's ID, deny access.
    // This assumes /profile/:id is meant to be for the authenticated user's own profile.
    // If /profile/:id is meant to view *other* users' profiles, this logic needs adjustment
    // and a different authorization strategy (e.g., role-based access control).
    if (request.route.path.includes('/profile/:id') && user.userId !== userIdParam) {
        throw new ForbiddenException('You are not authorized to access this profile');
    }

    throw new ForbiddenException('You are not authorized to access this resource');
  }
}
