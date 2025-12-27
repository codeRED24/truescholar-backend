import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { auth } from "../../../utils/auth"; // Adjusted path to utils/auth
import { IS_PUBLIC_KEY } from "../decorators/auth.decorators";
import { FastifyRequest } from "fastify";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();

    try {
      // Construct headers for Better Auth
      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
          } else {
            headers.append(key, value);
          }
        }
      });

      // Validate session
      const session = await auth.api.getSession({
        headers,
      });

      if (!session) {
        throw new UnauthorizedException();
      }

      // Attach session and user to request object for @Session() and @User() decorators
      (request as any).session = session.session;
      (request as any).user = session.user;

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
