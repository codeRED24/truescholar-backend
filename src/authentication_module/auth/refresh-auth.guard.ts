import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class RefreshAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();

    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new UnauthorizedException("No access token provided");
    }

    try {
      const decodedAccessToken = this.jwtService.verify(accessToken, {
        secret: process.env.JWT_SECRET,
      });

      // JWT is trusted, no need for additional DB validation
      req.user = {
        userId: decodedAccessToken.userId,
        email: decodedAccessToken.email,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
